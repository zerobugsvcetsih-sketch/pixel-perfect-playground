import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  COARSE_DT,
  COARSE_LEN,
  DEFAULT_THRESHOLDS,
  FINE_DT,
  FINE_LEN,
  SCENARIOS,
  bandEnergy,
  changeRate,
  detect,
  dominant,
  makeSample,
  seedSeries,
  spectrum,
  type Bin,
  type DangerLevel,
  type Detection,
  type Sample,
  type Scenario,
  type Thresholds,
} from "./engine";
import {
  LANGUAGES,
  audioAvailable,
  audioPath,
  languageForState,
  voiceLevelFor,
  type VoiceLanguage,
  type VoiceLevel,
} from "../voice";

export interface NodeState {
  id: string;
  name: string;
  role: string;
  lat: number;
  lon: number;
  pressure: number;
  temp: number;
  freq: number;
  battery: number;
  batteryV: number;
  solarV: number;
  solarA: number;
  charging: boolean;
  rssi: number;
  snr: number;
  link: "CONNECTED" | "WEAK" | "DISCONNECTED";
  lastPacket: number;
  packets: number;
  lost: number;
  event: DangerLevel;
}

export interface Packet {
  id: number;
  t: number;
  node: string;
  pressure: number;
  temp: number;
  freq: number;
  event: DangerLevel;
  rssi: number;
  status: "OK" | "CRC-ERR" | "LOST";
}

export interface EventRecord {
  id: number;
  t: number;
  node: string;
  location: string;
  pressure: number;
  temp: number;
  freq: number;
  level: DangerLevel;
  confidence: number;
  language: string;
  voice: string;
  siren: string;
  comms: string;
}

export interface AlertState {
  siren: "READY" | "TRIGGERED";
  speaker: "READY" | "PLAYING";
  dfplayer: "CONNECTED" | "OFFLINE";
  level: DangerLevel;
  language: string;
  source: "none" | "bundled-audio" | "browser-tts";
  lastTriggered: number | null;
}

export interface LocationState {
  country: string;
  state: string;
  district: string;
  lat: string;
  lon: string;
  auto: boolean;
}

export interface CsvDataset {
  name: string;
  rows: Record<string, string>[];
  columns: string[];
}

interface Store {
  ready: boolean;
  demoMode: boolean;
  fine: Sample[];
  coarse: Sample[];
  latest: Sample | null;
  rate: number;
  fluctRms: number;
  bins: Bin[];
  domFreq: number;
  energy: number;
  detection: Detection;
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
  thresholds: Thresholds;
  setThresholds: (t: Thresholds) => void;
  resetThresholds: () => void;
  fftWindow: number;
  setFftWindow: (n: number) => void;
  sampleRate: number;
  setSampleRate: (n: number) => void;
  bandpass: [number, number];
  setBandpass: (b: [number, number]) => void;
  nodes: NodeState[];
  packets: Packet[];
  clearPackets: () => void;
  sendTestPacket: () => void;
  pingNode: (id: string) => void;
  restartComms: () => void;
  events: EventRecord[];
  alert: AlertState;
  triggerAlert: (level: DangerLevel) => void;
  resetAlert: () => void;
  testSiren: () => void;
  playVoice: (code: string, level: VoiceLevel) => void;
  stopVoice: () => void;
  volume: number;
  setVolume: (v: number) => void;
  location: LocationState;
  setLocation: (l: LocationState) => void;
  autoLanguage: boolean;
  setAutoLanguage: (b: boolean) => void;
  manualLanguage: string;
  setManualLanguage: (c: string) => void;
  activeLanguage: VoiceLanguage;
  csv: CsvDataset | null;
  setCsv: (d: CsvDataset | null) => void;
  uptimeS: number;
}

const Ctx = createContext<Store | null>(null);

export function useSystem() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSystem must be used inside <SystemProvider>");
  return ctx;
}

let packetId = 1;
let eventId = 1;

export function SystemProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [fine, setFine] = useState<Sample[]>([]);
  const [coarse, setCoarse] = useState<Sample[]>([]);
  const [scenario, setScenarioState] = useState<Scenario>("normal");
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [fftWindow, setFftWindow] = useState(256);
  const [sampleRate, setSampleRate] = useState(1);
  const [bandpass, setBandpass] = useState<[number, number]>([0.01, 0.5]);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [volume, setVolume] = useState(0.8);
  const [csv, setCsv] = useState<CsvDataset | null>(null);
  const [uptimeS, setUptimeS] = useState(0);
  const [alert, setAlert] = useState<AlertState>({
    siren: "READY",
    speaker: "READY",
    dfplayer: "CONNECTED",
    level: "NORMAL",
    language: "Tamil",
    source: "none",
    lastTriggered: null,
  });
  const [location, setLocation] = useState<LocationState>({
    country: "India",
    state: "Tamil Nadu",
    district: "Madurai",
    lat: "9.9252",
    lon: "78.1198",
    auto: false,
  });
  const [autoLanguage, setAutoLanguage] = useState(true);
  const [manualLanguage, setManualLanguage] = useState("ta");
  const [commsSeed, setCommsSeed] = useState(0);

  const phase = useRef(0);
  const lastLevel = useRef<DangerLevel>("NORMAL");

  const activeLanguage = useMemo(() => {
    if (autoLanguage) return languageForState(location.state);
    return LANGUAGES.find((l) => l.code === manualLanguage) ?? LANGUAGES[1]!;
  }, [autoLanguage, manualLanguage, location.state]);

  // Seed after mount only, so SSR markup and client markup match.
  useEffect(() => {
    const now = Date.now();
    const sc = SCENARIOS.normal;
    setFine(seedSeries(now, FINE_DT, FINE_LEN, sc));
    setCoarse(seedSeries(now, COARSE_DT, COARSE_LEN, sc));
    setReady(true);
  }, []);

  // 1 Hz simulation tick.
  useEffect(() => {
    if (!ready) return;
    const sc = SCENARIOS[scenario];
    const id = setInterval(() => {
      phase.current += 1;
      const now = Date.now();
      const s = makeSample(now, sc, phase.current);
      setFine((prev) => [...prev.slice(-(FINE_LEN - 1)), s]);
      setUptimeS((u) => u + 1);
      if (phase.current % 30 === 0) setCoarse((prev) => [...prev.slice(-(COARSE_LEN - 1)), s]);
      if (phase.current % 5 === 0) {
        const lossy = Math.random() < (scenario === "critical" ? 0.09 : 0.03);
        setPackets((prev) =>
          [
            {
              id: packetId++,
              t: now,
              node: phase.current % 10 === 0 ? "NODE-B" : "NODE-A",
              pressure: s.cal,
              temp: s.temp,
              freq: sc.freq,
              event: lastLevel.current,
              rssi: -72 - Math.round(Math.random() * 18),
              status: lossy ? ("CRC-ERR" as const) : ("OK" as const),
            },
            ...prev,
          ].slice(0, 80),
        );
      }
    }, 1000);
    return () => clearInterval(id);
  }, [ready, scenario]);

  const bins = useMemo(
    () => spectrum(fine, fftWindow, sampleRate).filter((b) => b.f >= bandpass[0] && b.f <= bandpass[1]),
    [fine, fftWindow, sampleRate, bandpass],
  );
  const dom = useMemo(() => dominant(bins), [bins]);
  const energy = useMemo(
    () => bandEnergy(bins, thresholds.bandLo, thresholds.bandHi),
    [bins, thresholds.bandLo, thresholds.bandHi],
  );
  const rate = useMemo(() => changeRate(fine, FINE_DT), [fine]);
  const fluctRms = useMemo(() => {
    const w = fine.slice(-120);
    if (!w.length) return 0;
    const m = w.reduce((a, s) => a + s.fluct, 0) / w.length;
    return Math.sqrt(w.reduce((a, s) => a + (s.fluct - m) ** 2, 0) / w.length);
  }, [fine]);

  const crossNode = scenario !== "event";
  const detection = useMemo(
    () => detect(rate, fluctRms, energy, thresholds, crossNode),
    [rate, fluctRms, energy, thresholds, crossNode],
  );

  const latest = fine.length ? fine[fine.length - 1]! : null;

  const stopVoice = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    setAlert((a) => ({ ...a, speaker: "READY" }));
  }, []);

  const playVoice = useCallback(
    (code: string, level: VoiceLevel) => {
      const lang = LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[1]!;
      setAlert((a) => ({
        ...a,
        speaker: "PLAYING",
        language: lang.name,
        source: audioAvailable(code, level) ? "bundled-audio" : "browser-tts",
      }));
      if (typeof window === "undefined") return;
      if (audioAvailable(code, level)) {
        const audio = new Audio(audioPath(code, level));
        audio.volume = volume;
        audio.onended = () => setAlert((a) => ({ ...a, speaker: "READY" }));
        void audio.play().catch(() => setAlert((a) => ({ ...a, speaker: "READY" })));
        return;
      }
      const synth = window.speechSynthesis;
      if (!synth) {
        setTimeout(() => setAlert((a) => ({ ...a, speaker: "READY" })), 2500);
        return;
      }
      synth.cancel();
      const u = new SpeechSynthesisUtterance(lang.messages[level]);
      u.lang = `${code}-IN`;
      u.volume = volume;
      u.rate = 0.95;
      u.onend = () => setAlert((a) => ({ ...a, speaker: "READY" }));
      synth.speak(u);
    },
    [volume],
  );

  const pushEvent = useCallback(
    (level: DangerLevel, confidence: number, voice: string, siren: string) => {
      const s = latest;
      setEvents((prev) =>
        [
          {
            id: eventId++,
            t: Date.now(),
            node: "Coastal Node (NODE-A)",
            location: `${location.district}, ${location.state}`,
            pressure: s?.cal ?? 1008.2,
            temp: s?.temp ?? 28.4,
            freq: dom.f,
            level,
            confidence,
            language: activeLanguage.name,
            voice,
            siren,
            comms: "LoRa OK",
          },
          ...prev,
        ].slice(0, 100),
      );
    },
    [latest, location, dom.f, activeLanguage.name],
  );

  const triggerAlert = useCallback(
    (level: DangerLevel) => {
      const vl = voiceLevelFor(level);
      setAlert((a) => ({
        ...a,
        siren: level === "WARNING" || level === "CRITICAL" ? "TRIGGERED" : a.siren,
        level,
        lastTriggered: Date.now(),
        language: activeLanguage.name,
      }));
      if (vl) playVoice(activeLanguage.code, vl);
      pushEvent(
        level,
        detection.confidence,
        vl ? "Played" : "—",
        level === "WARNING" || level === "CRITICAL" ? "Triggered" : "—",
      );
    },
    [activeLanguage, playVoice, pushEvent, detection.confidence],
  );

  const resetAlert = useCallback(() => {
    stopVoice();
    setAlert((a) => ({ ...a, siren: "READY", speaker: "READY", level: "NORMAL", source: "none" }));
  }, [stopVoice]);

  const testSiren = useCallback(() => {
    setAlert((a) => ({ ...a, siren: "TRIGGERED" }));
    setTimeout(() => setAlert((a) => ({ ...a, siren: "READY" })), 4000);
  }, []);

  // Auto-log level escalations produced by the detection engine.
  useEffect(() => {
    if (!ready) return;
    if (detection.level !== lastLevel.current) {
      const prev = lastLevel.current;
      lastLevel.current = detection.level;
      const order: DangerLevel[] = ["NORMAL", "WATCH", "WARNING", "CRITICAL"];
      if (order.indexOf(detection.level) > order.indexOf(prev) && detection.level !== "NORMAL") {
        pushEvent(
          detection.level,
          detection.confidence,
          "Queued",
          detection.level === "CRITICAL" || detection.level === "WARNING" ? "Triggered" : "—",
        );
        setAlert((a) => ({
          ...a,
          level: detection.level,
          siren:
            detection.level === "CRITICAL" || detection.level === "WARNING" ? "TRIGGERED" : a.siren,
        }));
      }
    }
  }, [detection.level, detection.confidence, ready, pushEvent]);

  const setScenario = useCallback(
    (s: Scenario) => {
      setScenarioState(s);
      if (s === "normal") resetAlert();
    },
    [resetAlert],
  );

  const nodes: NodeState[] = useMemo(() => {
    const p = latest?.cal ?? 1008.2;
    const t = latest?.temp ?? 28.4;
    const drift = Math.sin(uptimeS / 90) * 0.06;
    const weak = commsSeed % 3 === 1;
    return [
      {
        id: "NODE-A",
        name: "Coastal Node",
        role: "Primary · shoreline microbarometer",
        lat: 9.2876,
        lon: 79.3129,
        pressure: p,
        temp: t,
        freq: dom.f,
        battery: 87,
        batteryV: 3.94,
        solarV: 5.62,
        solarA: 0.31,
        charging: true,
        rssi: -74,
        snr: 9.4,
        link: "CONNECTED",
        lastPacket: Date.now() - 2000,
        packets: 18342 + packets.length,
        lost: 213,
        event: detection.level,
      },
      {
        id: "NODE-B",
        name: "Inland Node",
        role: "Reference · 14.2 km inland gateway",
        lat: 9.4211,
        lon: 79.4402,
        pressure: p + drift + 0.12,
        temp: t - 1.3,
        freq: dom.f * 0.94,
        battery: 64,
        batteryV: 3.78,
        solarV: 5.11,
        solarA: 0.18,
        charging: false,
        rssi: weak ? -108 : -91,
        snr: weak ? 2.1 : 6.8,
        link: weak ? "WEAK" : "CONNECTED",
        lastPacket: Date.now() - 6000,
        packets: 17988 + packets.length,
        lost: 486,
        event: crossNode ? detection.level : "NORMAL",
      },
    ];
  }, [latest, dom.f, detection.level, packets.length, uptimeS, commsSeed, crossNode]);

  const value: Store = {
    ready,
    demoMode: true,
    fine,
    coarse,
    latest,
    rate,
    fluctRms,
    bins,
    domFreq: dom.f,
    energy,
    detection,
    scenario,
    setScenario,
    thresholds,
    setThresholds,
    resetThresholds: () => setThresholds(DEFAULT_THRESHOLDS),
    fftWindow,
    setFftWindow,
    sampleRate,
    setSampleRate,
    bandpass,
    setBandpass,
    nodes,
    packets,
    clearPackets: () => setPackets([]),
    sendTestPacket: () =>
      setPackets((prev) =>
        [
          {
            id: packetId++,
            t: Date.now(),
            node: "NODE-A",
            pressure: latest?.cal ?? 1008.2,
            temp: latest?.temp ?? 28.4,
            freq: dom.f,
            event: detection.level,
            rssi: -70,
            status: "OK" as const,
          },
          ...prev,
        ].slice(0, 80),
      ),
    pingNode: () => setCommsSeed((c) => c + 1),
    restartComms: () => {
      setCommsSeed((c) => c + 2);
      setPackets([]);
    },
    events,
    alert,
    triggerAlert,
    resetAlert,
    testSiren,
    playVoice,
    stopVoice,
    volume,
    setVolume,
    location,
    setLocation,
    autoLanguage,
    setAutoLanguage,
    manualLanguage,
    setManualLanguage,
    activeLanguage,
    csv,
    setCsv,
    uptimeS,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
