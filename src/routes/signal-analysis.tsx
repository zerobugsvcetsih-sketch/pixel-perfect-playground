import { createFileRoute } from "@tanstack/react-router";
import { DemoTag, Field, Metric, PageHeader, Panel, PanelHead, fmt } from "@/components/kit";
import { RateChart, SeriesChart, SpectrumChart } from "@/components/charts";
import { useSystem } from "@/lib/sim/store";
import { pageMeta } from "@/lib/meta";
import { Slider } from "@/components/ui/slider";
import { Waves } from "lucide-react";

export const Route = createFileRoute("/signal-analysis")({
  head: () =>
    pageMeta(
      "Signal Analysis",
      "FFT spectrum, band-pass filtering, change-rate and fluctuation analysis of microbarometer pressure data.",
    ),
  component: SignalAnalysis,
});

function SignalAnalysis() {
  const s = useSystem();
  const recent = s.fine.slice(-300);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Processing"
        title="Signal analysis"
        description="Band-limited spectrum and time-domain features used by the detection engine."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Dominant frequency" value={fmt(s.domFreq, 3)} unit="Hz" />
        <Metric label="Band energy" value={fmt(s.energy, 1)} unit="Pa²" />
        <Metric label="Change rate" value={fmt(s.rate, 3)} unit="hPa/min" />
        <Metric label="Fluctuation RMS" value={fmt(s.fluctRms, 2)} unit="Pa" />
      </div>
      <Panel>
        <PanelHead icon={<Waves className="size-4" />} title="Power spectrum" sub={`FFT window ${s.fftWindow} · band ${s.bandpass[0]}–${s.bandpass[1]} Hz`} right={<DemoTag />} />
        <div className="p-4">
          <SpectrumChart
            bins={s.bins}
            height={260}
            markers={[{ f: s.domFreq, label: "peak", color: "var(--chart-3)" }]}
          />
        </div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHead title="Detrended fluctuation" sub="Last 5 minutes" />
          <div className="p-4">
            <SeriesChart data={recent} dataKey="fluct" unit="Pa" zeroLine height={200} />
          </div>
        </Panel>
        <Panel>
          <PanelHead title="Pressure change rate" sub="Rolling 60 s" />
          <div className="p-4">
            <RateChart data={recent} height={200} />
          </div>
        </Panel>
      </div>
      <Panel>
        <PanelHead title="Processing parameters" sub="Adjust to explore the demo signal" />
        <div className="grid gap-6 p-5 md:grid-cols-3">
          <div>
            <Field label="FFT window" value={`${s.fftWindow} samples`} />
            <Slider className="mt-3" min={64} max={512} step={64} value={[s.fftWindow]} onValueChange={(v) => s.setFftWindow(v[0]!)} />
          </div>
          <div>
            <Field label="Band-pass low" value={`${s.bandpass[0]} Hz`} />
            <Slider className="mt-3" min={0.005} max={0.2} step={0.005} value={[s.bandpass[0]]} onValueChange={(v) => s.setBandpass([v[0]!, s.bandpass[1]])} />
          </div>
          <div>
            <Field label="Band-pass high" value={`${s.bandpass[1]} Hz`} />
            <Slider className="mt-3" min={0.25} max={0.5} step={0.01} value={[s.bandpass[1]]} onValueChange={(v) => s.setBandpass([s.bandpass[0], v[0]!])} />
          </div>
        </div>
      </Panel>
    </div>
  );
}
