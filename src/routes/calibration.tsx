import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { DemoTag, Disclaimer, Field, PageHeader, Panel, PanelHead, fmt } from "@/components/kit";
import { XYScatter } from "@/components/charts";
import { CALIBRATION, applyFit, fitCalibration, stats } from "@/lib/sim/engine";
import { useSystem } from "@/lib/sim/store";
import { pageMeta } from "@/lib/meta";
import { BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/calibration")({
  head: () =>
    pageMeta(
      "Calibration",
      "Sensor calibration against a reference instrument: offset, gain, temperature coefficient and residual error.",
    ),
  component: Calibration,
});

function Calibration() {
  const { fine } = useSystem();
  const fit = useMemo(() => fitCalibration(fine), [fine]);
  const calOf = (s: (typeof fine)[number]) => (fit ? applyFit(fit, s.raw, s.temp) : s.cal);
  const pts = useMemo(
    () => fine.filter((_, i) => i % 20 === 0).map((s) => ({ reference: s.ref, cal: calOf(s), raw: s.raw })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fine, fit],
  );
  const resid = stats(fine.slice(-300).map((s) => (calOf(s) - s.ref) * 100));
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Metrology"
        title="Calibration"
        description="Linear correction of the BMP390 against a traceable reference, with temperature compensation."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <PanelHead icon={<BadgeCheck className="size-4" />} title="Current coefficients" right={<DemoTag />} />
          <div className="px-5 py-3">
            <Field label="Offset" value={fit ? `${fmt(fit.offsetHpa, 3)} hPa` : "—"} />
            <Field label="Gain" value={fit ? fmt(fit.gain, 5) : "—"} />
            <Field label="Temp. coefficient" value={fit ? `${fmt(fit.tempCoefHpaPerC, 4)} hPa/°C` : "—"} />
            <Field label="Calibration date" value={CALIBRATION.date} />
            <Field label="Reference" value={CALIBRATION.referenceInstrument} />
            <Field label="Calibration points" value={fit ? fit.points : 0} />
          </div>
        </Panel>
        <Panel className="lg:col-span-2">
          <PanelHead title="Sensor vs reference" sub="Calibrated reading against reference, 1:1 line" />
          <div className="p-4">
            <XYScatter data={pts} xKey="reference" yKey="cal" xLabel="Reference hPa" yLabel="Sensor hPa" height={260} />
          </div>
        </Panel>
      </div>
      <Panel>
        <PanelHead title="Residual error (last 5 min)" right={<DemoTag />} />
        <div className="grid gap-x-8 px-5 py-3 md:grid-cols-4">
          <Field label="Mean" value={`${fmt(resid.mean, 2)} Pa`} />
          <Field label="Std. dev." value={`${fmt(resid.sd, 2)} Pa`} />
          <Field label="Min" value={`${fmt(resid.min, 2)} Pa`} />
          <Field label="Max" value={`${fmt(resid.max, 2)} Pa`} />
        </div>
        <div className="px-5 pb-4">
          <Disclaimer>Coefficients shown are demo values. Real calibration needs a chamber sweep against the reference.</Disclaimer>
        </div>
      </Panel>
    </div>
  );
}
