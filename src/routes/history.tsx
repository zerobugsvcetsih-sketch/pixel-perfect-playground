import { createFileRoute } from "@tanstack/react-router";
import { LevelBadge, PageHeader, Panel, PanelHead, clock, fmt } from "@/components/kit";
import { useSystem } from "@/lib/sim/store";
import { pageMeta } from "@/lib/meta";
import { Button } from "@/components/ui/button";
import { History as HistoryIcon, Download } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => pageMeta("Event History", "Log of detected pressure events and alerts, with level, confidence and response actions."),
  component: HistoryPage,
});

function HistoryPage() {
  const { events } = useSystem();
  const exportCsv = () => {
    const head = "time,node,location,pressure,temp,freq,level,confidence,language,voice,siren,comms";
    const rows = events.map((e) =>
      [new Date(e.t).toISOString(), e.node, e.location, e.pressure, e.temp, e.freq, e.level, e.confidence, e.language, e.voice, e.siren, e.comms]
        .map((v) => `"${v}"`).join(","),
    );
    const url = URL.createObjectURL(new Blob([[head, ...rows].join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "event-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Records"
        title="Event history"
        description="Every escalation and manual alert in this session. Switch scenarios on the dashboard to generate events."
        actions={<Button size="sm" variant="outline" disabled={!events.length} onClick={exportCsv}><Download className="size-3.5" /> Export CSV</Button>}
      />
      <Panel>
        <PanelHead icon={<HistoryIcon className="size-4" />} title="Events" sub={`${events.length} recorded`} />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="label-caps text-left">
              <tr className="[&_th]:px-3 [&_th]:py-2"><th>Time</th><th>Level</th><th>Node</th><th>Location</th><th>hPa</th><th>Hz</th><th>Conf.</th><th>Language</th><th>Voice</th><th>Siren</th></tr>
            </thead>
            <tbody className="readout">
              {events.map((e) => (
                <tr key={e.id} className="border-t border-border [&_td]:px-3 [&_td]:py-2">
                  <td>{clock(e.t)}</td><td><LevelBadge level={e.level} size="sm" /></td><td>{e.node}</td><td>{e.location}</td>
                  <td>{fmt(e.pressure, 2)}</td><td>{fmt(e.freq, 3)}</td><td>{e.confidence}%</td><td>{e.language}</td><td>{e.voice}</td><td>{e.siren}</td>
                </tr>
              ))}
              {!events.length && <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">No events yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
