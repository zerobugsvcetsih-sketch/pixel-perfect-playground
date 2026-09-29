import { createFileRoute } from "@tanstack/react-router";
import { DemoTag, Disclaimer, Field, LevelBadge, PageHeader, Panel, PanelHead, fmt } from "@/components/kit";
import { ScenarioBar } from "@/components/ScenarioBar";
import { LEVEL_META, type DangerLevel } from "@/lib/sim/engine";
import { useSystem } from "@/lib/sim/store";
import { pageMeta } from "@/lib/meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/danger")({
  head: () =>
    pageMeta(
      "Danger Detection",
      "Multi-criteria hazard detection: pressure change rate, fluctuation RMS and spectral energy with configurable thresholds.",
    ),
  component: Danger,
});

const LEVELS: DangerLevel[] = ["NORMAL", "WATCH", "WARNING", "CRITICAL"];

function Danger() {
  const { detection, thresholds, setThresholds, resetThresholds } = useSystem();
  const num = (k: keyof typeof thresholds) => (
    <Input
      type="number"
      step="any"
      className="h-8 w-24 font-mono text-xs"
      value={String(thresholds[k])}
      onChange={(e) => setThresholds({ ...thresholds, [k]: Number(e.target.value) })}
    />
  );
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Decision"
        title="Danger detection engine"
        description="Three independent indicators are scored; escalation above Warning needs agreement between indicators and nodes."
      />
      <ScenarioBar />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <PanelHead icon={<ShieldAlert className="size-4" />} title="Current assessment" right={<DemoTag />} />
          <div className="space-y-4 p-5">
            <LevelBadge level={detection.level} size="lg" />
            <p className="text-sm text-muted-foreground">{LEVEL_META[detection.level].note}</p>
            <Field label="Confidence" value={`${detection.confidence}%`} />
          </div>
        </Panel>
        <Panel className="lg:col-span-2">
          <PanelHead title="Indicators" sub="Live value against watch threshold" />
          <div className="divide-y divide-border">
            {detection.triggers.map((t) => (
              <div key={t.name} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">threshold {t.threshold} {t.unit}</p>
                </div>
                <div className="text-right">
                  <p className={cn("readout text-lg", t.hit ? "text-warning" : "text-ok")}>{fmt(t.value, 3)}</p>
                  <p className="label-caps">{t.hit ? "EXCEEDED" : "OK"}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {LEVELS.map((l) => (
          <Panel key={l} className={cn("p-4", detection.level === l && "ring-2 ring-instrument")}>
            <LevelBadge level={l} size="sm" />
            <p className="mt-2 text-xs font-medium">{LEVEL_META[l].label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{LEVEL_META[l].note}</p>
          </Panel>
        ))}
      </div>
      <Panel>
        <PanelHead title="Thresholds" right={<Button size="sm" variant="outline" onClick={resetThresholds}>Reset defaults</Button>} />
        <div className="overflow-x-auto p-5">
          <table className="w-full text-sm">
            <thead className="label-caps text-left">
              <tr><th className="pb-2">Indicator</th><th>Watch</th><th>Warning</th><th>Critical</th></tr>
            </thead>
            <tbody className="[&_td]:py-1.5">
              <tr><td>Change rate (hPa/min)</td><td>{num("rateWatch")}</td><td>{num("rateWarning")}</td><td>{num("rateCritical")}</td></tr>
              <tr><td>Fluctuation RMS (Pa)</td><td>{num("fluctWatch")}</td><td>{num("fluctWarning")}</td><td>{num("fluctCritical")}</td></tr>
              <tr><td>Spectral energy (Pa²)</td><td>{num("spectralWatch")}</td><td>{num("spectralWarning")}</td><td>{num("spectralCritical")}</td></tr>
            </tbody>
          </table>
          <div className="mt-4 flex items-center gap-3">
            <Switch checked={thresholds.requireCrossNode} onCheckedChange={(v) => setThresholds({ ...thresholds, requireCrossNode: v })} />
            <span className="text-sm">Require second-node agreement for CRITICAL</span>
          </div>
        </div>
      </Panel>
      <Disclaimer tone="warn">This is a research prototype. It is not a certified warning system and must not replace official alerts.</Disclaimer>
    </div>
  );
}
