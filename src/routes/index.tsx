import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Disclaimer,
  Field,
  LevelBadge,
  Metric,
  Panel,
  PanelHead,
  DemoTag,
  clock,
  fmt,
} from "@/components/kit";
import { PressurePanel } from "@/components/PressurePanel";
import { ScenarioBar } from "@/components/ScenarioBar";
import { SpectrumChart } from "@/components/charts";
import { useSystem } from "@/lib/sim/store";
import { LEVEL_META } from "@/lib/sim/engine";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AudioLines,
  Battery,
  Megaphone,
  Network,
  Radio,
  ThermometerSun,
  Waves,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Monitoring Dashboard — Microbarometer & Infrasound Detection" },
      {
        name: "description",
        content:
          "Live demo console: atmospheric pressure, temperature, change rate, dominant frequency, event risk level and sensor health for a multi-parameter microbarometer network.",
      },
      { property: "og:title", content: "Microbarometer Monitoring Dashboard" },
      {
        property: "og:description",
        content:
          "Pressure, spectral and multi-node event detection console with localized multilingual alerting. Demo data.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { latest, rate, domFreq, detection, nodes, alert, events, activeLanguage, energy } =
    useSystem();
  const meta = LEVEL_META[detection.level];

  return (
    <div className="space-y-6">
      <section className="panel tech-grid relative overflow-hidden px-5 py-6 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label-caps">System status</p>
            <div className="mt-2 flex items-center gap-3">
              <LevelBadge level={detection.level} size="lg" />
              <span className="readout text-sm text-muted-foreground">
                confidence {detection.confidence}% <DemoTag label="DEMO VALUE" />
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{meta.note}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs tracking-[0.18em] text-instrument">
              MEASURE · CALIBRATE · ANALYZE · VALIDATE · ALERT
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              BMP390 primary · ESP32-S3 edge · LoRa + ESP-NOW
            </p>
          </div>
        </div>
      </section>

      <ScenarioBar />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Metric
          label="Atmospheric pressure"
          value={fmt(latest?.cal, 2)}
          unit="hPa"
          sub="Calibrated + temp-compensated"
        />
        <Metric
          label="Temperature"
          value={fmt(latest?.temp, 1)}
          unit="°C"
          sub="On-die BMP390 sensor"
          icon={<ThermometerSun className="size-4" />}
        />
        <Metric
          label="Pressure change rate"
          value={fmt(rate, 3)}
          unit="hPa/min"
          sub="60 s linear window"
          tone={Math.abs(rate) > 0.12 ? "warning" : "default"}
        />
        <Metric
          label="Dominant frequency"
          value={fmt(domFreq, 3)}
          unit="Hz"
          sub="Derived from sampled pressure"
          icon={<Waves className="size-4" />}
        />
        <Metric
          label="Event risk level"
          value={detection.level}
          sub={`Spectral energy ${fmt(energy, 1)} Pa²`}
          tone={meta.token as "ok"}
        />
        <Metric
          label="Sensor health"
          value="ONLINE"
          sub="0 faults · 2/2 nodes reporting"
          tone="ok"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PressurePanel />
        </div>

        <Panel className="flex flex-col">
          <PanelHead
            icon={<Activity className="size-4" />}
            title="Danger detection"
            sub="Multi-feature threshold engine"
            right={<LevelBadge level={detection.level} size="sm" />}
          />
          <div className="space-y-3 px-4 py-4 sm:px-5">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="label-caps">Event confidence</span>
                <span className="readout text-sm">{detection.confidence}%</span>
              </div>
              <Progress value={detection.confidence} className="mt-2 h-1.5" />
            </div>
            {detection.triggers.map((t) => (
              <div key={t.name} className="rounded-md border border-border bg-secondary/50 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">{t.name}</span>
                  <span className={t.hit ? "readout text-xs text-warning" : "readout text-xs"}>
                    {fmt(t.value, 2)} {t.unit}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  watch ≥ {t.threshold} {t.unit}
                </p>
              </div>
            ))}
            <Disclaimer tone="warn">
              EXPERIMENTAL THRESHOLDS — TO BE VALIDATED. These limits are configurable defaults, not
              scientifically established criteria.
            </Disclaimer>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/danger">Open detection engine</Link>
            </Button>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHead
            icon={<Waves className="size-4" />}
            title="FFT spectrum"
            sub="Hann-windowed DFT of detrended pressure fluctuation"
            right={<DemoTag />}
          />
          <div className="px-2 py-3 sm:px-3">
            <SpectrumChart bins={useSystem().bins} height={220} />
          </div>
          <div className="px-4 pb-4 sm:px-5">
            <Disclaimer>
              Frequency response is experimental and must be validated with real measurements.
            </Disclaimer>
          </div>
        </Panel>

        <Panel>
          <PanelHead
            icon={<Network className="size-4" />}
            title="Node network"
            sub="Distributed cross-validation"
            right={
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                <Link to="/nodes">Details</Link>
              </Button>
            }
          />
          <div className="grid gap-px bg-border sm:grid-cols-2">
            {nodes.map((n) => (
              <div key={n.id} className="space-y-1 bg-panel p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{n.name}</p>
                  <LevelBadge level={n.event} size="sm" />
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">{n.id} · {n.role}</p>
                <div className="pt-1">
                  <Field label="Pressure" value={`${fmt(n.pressure, 2)} hPa`} />
                  <Field label="Temperature" value={`${fmt(n.temp, 1)} °C`} />
                  <Field label="Dominant freq." value={`${fmt(n.freq, 3)} Hz`} />
                  <Field
                    label="Battery"
                    value={
                      <span className="inline-flex items-center gap-1">
                        <Battery className="size-3.5 text-muted-foreground" />
                        {n.battery}%
                      </span>
                    }
                  />
                  <Field
                    label="Link"
                    value={
                      <span className="inline-flex items-center gap-1">
                        <Radio className="size-3.5 text-muted-foreground" />
                        {n.link} · {n.rssi} dBm
                      </span>
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <PanelHead
            icon={<Megaphone className="size-4" />}
            title="Local alert status"
            sub="Offline siren + voice controller"
          />
          <div className="px-4 py-3 sm:px-5">
            <Field label="Siren" value={alert.siren} />
            <Field label="Speaker" value={alert.speaker} />
            <Field label="DFPlayer" value={alert.dfplayer} />
            <Field label="Alert type" value={alert.level} />
            <Field
              label="Last triggered"
              value={alert.lastTriggered ? clock(alert.lastTriggered) : "—"}
            />
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <Link to="/alerts">Alert controller</Link>
            </Button>
          </div>
        </Panel>

        <Panel>
          <PanelHead
            icon={<AudioLines className="size-4" />}
            title="Voice alert language"
            sub="Location → language engine"
          />
          <div className="px-4 py-3 sm:px-5">
            <Field label="Detected region" value={useSystem().location.state} />
            <Field label="Selected language" value={`${activeLanguage.name} (${activeLanguage.native})`} />
            <Field label="Mode" value={useSystem().autoLanguage ? "Automatic" : "Manual override"} />
            <p className="mt-3 rounded-md border border-border bg-secondary/60 p-2.5 text-[11px] leading-relaxed">
              {activeLanguage.messages.WARNING}
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <Link to="/voice">Voice center</Link>
            </Button>
          </div>
        </Panel>

        <Panel>
          <PanelHead
            icon={<Activity className="size-4" />}
            title="Recent events"
            sub="Auto-logged level escalations"
            right={
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                <Link to="/history">All</Link>
              </Button>
            }
          />
          <ul className="divide-y divide-border">
            {events.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-2.5 text-xs sm:px-5">
                <span className="readout text-muted-foreground">{clock(e.t)}</span>
                <LevelBadge level={e.level} size="sm" />
                <span className="readout ml-auto">{fmt(e.pressure, 2)} hPa</span>
                <DemoTag />
              </li>
            ))}
            {!events.length && (
              <li className="px-4 py-6 text-center text-xs text-muted-foreground sm:px-5">
                No escalations logged yet. Inject a demo scenario above.
              </li>
            )}
          </ul>
        </Panel>
      </div>

      <Disclaimer>
        This prototype is an additional local warning layer. It does not replace official warning
        systems, and no value on this dashboard is field-measured data.
      </Disclaimer>
    </div>
  );
}
