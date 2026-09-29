import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import Papa from "papaparse";
import { DemoTag, Disclaimer, Field, PageHeader, Panel, PanelHead, fmt } from "@/components/kit";
import { SimpleBar } from "@/components/charts";
import { stats } from "@/lib/sim/engine";
import { useSystem } from "@/lib/sim/store";
import { pageMeta } from "@/lib/meta";
import { Button } from "@/components/ui/button";
import { Activity, Upload } from "lucide-react";

export const Route = createFileRoute("/validation")({
  head: () => pageMeta("Validation", "Validate sensor performance against reference data and uploaded CSV datasets."),
  component: Validation,
});

function Validation() {
  const { fine, csv, setCsv } = useSystem();
  const err = useMemo(() => fine.slice(-600).map((s) => (s.cal - s.ref) * 100), [fine]);
  const st = stats(err);
  const rmse = Math.sqrt(err.reduce((a, e) => a + e * e, 0) / (err.length || 1));
  const hist = useMemo(() => {
    const b: Record<string, number> = {};
    for (const e of err) {
      const k = (Math.round(e / 2) * 2).toFixed(0);
      b[k] = (b[k] ?? 0) + 1;
    }
    return Object.entries(b)
      .sort((a, c) => Number(a[0]) - Number(c[0]))
      .map(([bin, count]) => ({ bin, count }));
  }, [err]);

  const onFile = (f: File) => {
    Papa.parse<Record<string, string>>(f, {
      header: true,
      skipEmptyLines: true,
      complete: (r) => setCsv({ name: f.name, rows: r.data, columns: r.meta.fields ?? [] }),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Evaluation" title="Validation" description="Error statistics between the sensor and reference, plus import of recorded field data." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <PanelHead icon={<Activity className="size-4" />} title="Error statistics" sub="Last 10 minutes" right={<DemoTag />} />
          <div className="px-5 py-3">
            <Field label="RMSE" value={`${fmt(rmse, 2)} Pa`} />
            <Field label="Bias" value={`${fmt(st.mean, 2)} Pa`} />
            <Field label="Std. dev." value={`${fmt(st.sd, 2)} Pa`} />
            <Field label="Samples" value={err.length} />
          </div>
        </Panel>
        <Panel className="lg:col-span-2">
          <PanelHead title="Error distribution" sub="Sensor − reference, 2 Pa bins" />
          <div className="p-4"><SimpleBar data={hist} xKey="bin" yKey="count" unit="" height={220} /></div>
        </Panel>
      </div>
      <Panel>
        <PanelHead
          title="Import CSV dataset"
          sub={csv ? `${csv.name} · ${csv.rows.length} rows` : "Upload a recorded log to preview it"}
          right={
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <label className="cursor-pointer">
                  <Upload className="size-3.5" /> Choose file
                  <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
                </label>
              </Button>
              {csv && <Button size="sm" variant="outline" onClick={() => setCsv(null)}>Clear</Button>}
            </div>
          }
        />
        {csv ? (
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-xs">
              <thead className="label-caps sticky top-0 bg-panel text-left">
                <tr>{csv.columns.map((c) => <th key={c} className="px-3 py-2">{c}</th>)}</tr>
              </thead>
              <tbody className="readout">
                {csv.rows.slice(0, 200).map((r, i) => (
                  <tr key={i} className="border-t border-border">{csv.columns.map((c) => <td key={c} className="px-3 py-1">{r[c]}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5"><Disclaimer>Your file stays in this browser; nothing is uploaded to a server.</Disclaimer></div>
        )}
      </Panel>
    </div>
  );
}
