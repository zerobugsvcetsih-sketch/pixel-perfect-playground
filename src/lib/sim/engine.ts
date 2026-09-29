/**
 * Demo signal generator + signal-processing helpers.
 *
 * EVERYTHING produced here is SIMULATED. No hardware is attached.
 * The shapes of `Sample`, `NodeState` and `Telemetry` mirror the payload an
 * ESP32-S3 node would send over LoRa / Wi-Fi, so a real transport can replace
 * this generator without touching the UI layer.
 */

export type DangerLevel = "NORMAL" | "WATCH" | "WARNING" | "CRITICAL";
export type Scenario = "normal" | "event" | "warning" | "critical";

export interface Sample {
  /** epoch ms */
  t: number;
  /** raw sensor pressure, hPa */
  raw: number;
  /** calibrated + temperature-compensated pressure, hPa */
  cal: number;
  /** reference instrument pressure, hPa */
  ref: number;
  /** filtered (band-limited) pressure, hPa */
  filt: number;
  /** detrended pressure fluctuation, Pa */
  fluct: number;
  /** temperature, degC */
  temp: number;
}

export interface Bin {
  f: number;
  mag: number;
}

export const FINE_DT = 1000; // 1 Hz live buffer
export const FINE_LEN = 960; // 16 min
export const COARSE_DT = 30_000; // 24 h archive at 30 s
export const COARSE_LEN = 2880;

export const CALIBRATION = {
  offsetHpa: -0.45,
  gain: 1.0004,
  tempCoefHpaPerC: -0.012,
  date: "2026-09-12",
  referenceInstrument: "REF-DPI-740 / SN 41822",
  points: 24,
};

const BASE_PRESSURE = 1008.2;
const BASE_TEMP = 28.4;

export interface ScenarioProfile {
  /** fluctuation amplitude in Pa */
  amp: number;
  /** injected dominant frequency in Hz */
  freq: number;
  /** secondary band energy multiplier */
  broadband: number;
  /** slow pressure trend, hPa/min */
  trend: number;
}

export const SCENARIOS: Record<Scenario, ScenarioProfile> = {
  normal: { amp: 1.2, freq: 0.08, broadband: 1, trend: -0.004 },
  event: { amp: 6.5, freq: 0.24, broadband: 1.6, trend: -0.03 },
  warning: { amp: 14, freq: 0.38, broadband: 2.4, trend: -0.09 },
  critical: { amp: 34, freq: 0.42, broadband: 3.4, trend: -0.22 },
};

function noise(seedRef: { v: number }) {
  // deterministic-ish pseudo random so SSR/client stay tame
  seedRef.v = (seedRef.v * 1664525 + 1013904223) % 4294967296;
  return seedRef.v / 4294967296 - 0.5;
}

const seed = { v: 20260928 };

/** Generate one sample at time t for a given scenario phase. */
export function makeSample(t: number, sc: ScenarioProfile, phase: number): Sample {
  const secs = t / 1000;
  const slow =
    Math.sin(secs / 900) * 0.35 + Math.sin(secs / 337) * 0.12 + (sc.trend * (phase % 600)) / 60;
  const osc = sc.amp * Math.sin(2 * Math.PI * sc.freq * secs);
  const osc2 = sc.amp * 0.32 * Math.sin(2 * Math.PI * sc.freq * 2.37 * secs + 1.1);
  const n = noise(seed) * 2.4 * sc.broadband;
  const flucPa = osc + osc2 + n; // Pa
  const temp = BASE_TEMP + Math.sin(secs / 1800) * 0.9 + noise(seed) * 0.08;

  const truth = BASE_PRESSURE + slow + flucPa / 100;
  // raw sensor carries offset + gain error + temperature dependence
  const raw =
    (truth - CALIBRATION.offsetHpa) / CALIBRATION.gain -
    CALIBRATION.tempCoefHpaPerC * (temp - 25) +
    noise(seed) * 0.004;
  const cal = applyCalibration(raw, temp);
  const ref = truth + noise(seed) * 0.0025;

  return {
    t,
    raw,
    cal,
    ref,
    filt: BASE_PRESSURE + slow + (osc + osc2) / 100,
    fluct: flucPa,
    temp,
  };
}

export function applyCalibration(raw: number, temp: number) {
  return (
    raw * CALIBRATION.gain +
    CALIBRATION.offsetHpa +
    CALIBRATION.tempCoefHpaPerC * (temp - 25)
  );
}

export function seedSeries(now: number, dt: number, len: number, sc: ScenarioProfile): Sample[] {
  const out: Sample[] = [];
  for (let i = len - 1; i >= 0; i--) out.push(makeSample(now - i * dt, sc, len - i));
  return out;
}

/** Naive DFT magnitude spectrum of the detrended fluctuation signal. */
export function spectrum(samples: Sample[], window: number, sampleRateHz: number): Bin[] {
  const n = Math.min(window, samples.length);
  if (n < 8) return [];
  const slice = samples.slice(-n);
  const mean = slice.reduce((a, s) => a + s.fluct, 0) / n;
  const x = slice.map((s, i) => {
    const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)); // Hann
    return (s.fluct - mean) * w;
  });
  const bins: Bin[] = [];
  const half = Math.floor(n / 2);
  for (let k = 1; k < half; k++) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI * k * i) / n;
      re += x[i]! * Math.cos(a);
      im -= x[i]! * Math.sin(a);
    }
    bins.push({ f: (k * sampleRateHz) / n, mag: (2 * Math.sqrt(re * re + im * im)) / n });
  }
  return bins;
}

export function dominant(bins: Bin[]) {
  return bins.reduce((best, b) => (b.mag > best.mag ? b : best), { f: 0, mag: 0 });
}

export function bandEnergy(bins: Bin[], lo: number, hi: number) {
  return bins.filter((b) => b.f >= lo && b.f <= hi).reduce((a, b) => a + b.mag * b.mag, 0);
}

export function stats(values: number[]) {
  if (!values.length) return { min: 0, max: 0, mean: 0, sd: 0 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
  return { min, max, mean, sd };
}

/** hPa/min from the last `win` samples. */
export function changeRate(samples: Sample[], dtMs: number, win = 60) {
  const n = Math.min(win, samples.length);
  if (n < 2) return 0;
  const a = samples[samples.length - n]!;
  const b = samples[samples.length - 1]!;
  const minutes = ((b.t - a.t) || dtMs) / 60000;
  return (b.cal - a.cal) / minutes;
}

export interface Thresholds {
  rateWatch: number;
  rateWarning: number;
  rateCritical: number;
  fluctWatch: number;
  fluctWarning: number;
  fluctCritical: number;
  bandLo: number;
  bandHi: number;
  spectralWatch: number;
  spectralWarning: number;
  spectralCritical: number;
  minDurationS: number;
  requireCrossNode: boolean;
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  rateWatch: 0.05,
  rateWarning: 0.12,
  rateCritical: 0.25,
  fluctWatch: 4,
  fluctWarning: 10,
  fluctCritical: 22,
  bandLo: 0.05,
  bandHi: 0.8,
  spectralWatch: 6,
  spectralWarning: 40,
  spectralCritical: 200,
  minDurationS: 20,
  requireCrossNode: true,
};

export interface Detection {
  level: DangerLevel;
  confidence: number;
  triggers: { name: string; value: number; unit: string; threshold: number; hit: boolean }[];
}

export function detect(
  rate: number,
  fluctRms: number,
  energy: number,
  th: Thresholds,
  crossNodeAgreement: boolean,
): Detection {
  const score = (v: number, w: number, wa: number, c: number) =>
    v >= c ? 3 : v >= wa ? 2 : v >= w ? 1 : 0;

  const sRate = score(Math.abs(rate), th.rateWatch, th.rateWarning, th.rateCritical);
  const sFluct = score(fluctRms, th.fluctWatch, th.fluctWarning, th.fluctCritical);
  const sEnergy = score(energy, th.spectralWatch, th.spectralWarning, th.spectralCritical);

  let lvl = Math.max(sRate, sFluct, sEnergy);
  const agreeing = [sRate, sFluct, sEnergy].filter((s) => s >= 2).length;
  if (lvl >= 2 && agreeing < 2) lvl = Math.min(lvl, 2);
  if (lvl === 3 && th.requireCrossNode && !crossNodeAgreement) lvl = 2;

  const levels: DangerLevel[] = ["NORMAL", "WATCH", "WARNING", "CRITICAL"];
  const raw = (sRate + sFluct + sEnergy) / 9;
  const confidence = Math.round(
    Math.min(0.97, raw * 0.8 + (crossNodeAgreement ? 0.12 : 0) + 0.04) * 100,
  );

  return {
    level: levels[lvl]!,
    confidence: lvl === 0 ? Math.max(3, Math.round(raw * 30)) : confidence,
    triggers: [
      {
        name: "Pressure change rate |ΔP/Δt|",
        value: Math.abs(rate),
        unit: "hPa/min",
        threshold: th.rateWatch,
        hit: sRate > 0,
      },
      {
        name: "Fluctuation RMS",
        value: fluctRms,
        unit: "Pa",
        threshold: th.fluctWatch,
        hit: sFluct > 0,
      },
      {
        name: `Spectral energy ${th.bandLo}–${th.bandHi} Hz`,
        value: energy,
        unit: "Pa²",
        threshold: th.spectralWatch,
        hit: sEnergy > 0,
      },
    ],
  };
}

export const LEVEL_META: Record<
  DangerLevel,
  { label: string; token: string; text: string; bg: string; ring: string; note: string }
> = {
  NORMAL: {
    label: "Level 1 · Normal",
    token: "ok",
    text: "text-ok",
    bg: "bg-ok/10",
    ring: "ring-ok/30",
    note: "No abnormal pressure pattern detected.",
  },
  WATCH: {
    label: "Level 2 · Watch",
    token: "watch",
    text: "text-watch",
    bg: "bg-watch/10",
    ring: "ring-watch/30",
    note: "Pressure change or spectral feature exceeds the configured monitoring threshold.",
  },
  WARNING: {
    label: "Level 3 · Warning",
    token: "warning",
    text: "text-warning",
    bg: "bg-warning/10",
    ring: "ring-warning/30",
    note: "Multiple pressure/spectral features indicate an abnormal event pattern.",
  },
  CRITICAL: {
    label: "Level 4 · Critical",
    token: "critical",
    text: "text-critical",
    bg: "bg-critical/10",
    ring: "ring-critical/40",
    note: "Validated multi-parameter event condition triggers the local emergency alert.",
  },
};
