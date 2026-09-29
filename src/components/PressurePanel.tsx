import { useMemo, useState } from "react";
import { Panel, PanelHead, DemoTag, fmt } from "@/components/kit";
import { PressureChart } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useSystem } from "@/lib/sim/store";
import { stats } from "@/lib/sim/engine";
import { Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

const RANGES = [
  { key: "1m", label: "1 min", ms: 60_000 },
  { key: "5m", label: "5 min", ms: 300_000 },
  { key: "15m", label: "15 min", ms: 900_000 },
  { key: "1h", label: "1 hour", ms: 3_600_000 },
  { key: "6h", label: "6 hours", ms: 21_600_000 },
  { key: "24h", label: "24 hours", ms: 86_400_000 },
] as const;

export function PressurePanel({ height = 320 }: { height?: number }) {
  const { fine, coarse, ready } = useSystem();
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("5m");
  const [show, setShow] = useState({ raw: false, cal: true, ref: true });

  const cfg = RANGES.find((r) => r.key === range)!;
  const data = useMemo(() => {
    const src = cfg.ms <= 900_000 ? fine : coarse;
    const cutoff = Date.now() - cfg.ms;
    const win = src.filter((s) => s.t >= cutoff);
    return win.length > 4 ? win : src.slice(-120);
  }, [fine, coarse, cfg.ms]);

  const s = stats(data.map((d) => d.cal));
  const current = data.length ? data[data.length - 1].cal : 0;

  return (
    <Panel>
      <PanelHead
        icon={<Gauge className="size-4" />}
        title="Pressure vs time"
        sub="Calibrated series with reference-instrument overlay · line style distinguishes each trace"
        right={<DemoTag label="DEMO SERIES" />}
      />
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5 sm:px-5">
        <div className="flex flex-wrap gap-1">
          {RANGES.map((r) => (
            <Button
              key={r.key}
              size="sm"
              variant={range === r.key ? "secondary" : "ghost"}
              className={cn(
                "h-7 px-2.5 font-mono text-[11px]",
                range === r.key && "ring-1 ring-instrument/40",
              )}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-1">
          {(
            [
              ["raw", "Raw — dashed"],
              ["cal", "Calibrated — solid"],
              ["ref", "Reference — dotted"],
            ] as const
          ).map(([k, label]) => (
            <Toggle
              key={k}
              size="sm"
              pressed={show[k]}
              onPressedChange={(v) => setShow((p) => ({ ...p, [k]: v }))}
              className="h-7 px-2.5 font-mono text-[11px] data-[state=on]:bg-instrument-soft data-[state=on]:text-instrument"
            >
              {label}
            </Toggle>
          ))}
        </div>
      </div>
      <div className="px-2 py-3 sm:px-3">
        {ready ? (
          <PressureChart data={data} show={show} height={height} />
        ) : (
          <div
            style={{ height }}
            className="flex items-center justify-center text-xs text-muted-foreground"
          >
            Initialising demo acquisition buffer…
          </div>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-5">
        {[
          ["Current", fmt(current, 3)],
          ["Minimum", fmt(s.min, 3)],
          ["Maximum", fmt(s.max, 3)],
          ["Mean", fmt(s.mean, 3)],
          ["Std. dev.", fmt(s.sd, 4)],
        ].map(([k, v]) => (
          <div key={k} className="bg-panel px-4 py-2.5">
            <dt className="label-caps">{k}</dt>
            <dd className="readout mt-0.5 text-sm">
              {v} <span className="text-[10px] text-muted-foreground">hPa</span>
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
