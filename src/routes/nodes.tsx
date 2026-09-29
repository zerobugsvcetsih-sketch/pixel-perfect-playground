import { createFileRoute } from "@tanstack/react-router";
import { DemoTag, Field, LevelBadge, PageHeader, Panel, PanelHead, StatusDot, clock, fmt } from "@/components/kit";
import { useSystem } from "@/lib/sim/store";
import { pageMeta } from "@/lib/meta";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Network } from "lucide-react";

export const Route = createFileRoute("/nodes")({
  head: () =>
    pageMeta("Node Network", "Status of the coastal and inland microbarometer nodes: position, power, link and readings."),
  component: Nodes,
});

function Nodes() {
  const { nodes, pingNode } = useSystem();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Network"
        title="Node network"
        description="Two nodes 14 km apart allow cross-checking so a single noisy sensor cannot raise a critical alert."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {nodes.map((n) => (
          <Panel key={n.id}>
            <PanelHead
              icon={<Network className="size-4" />}
              title={`${n.name} · ${n.id}`}
              sub={n.role}
              right={<DemoTag />}
            />
            <div className="space-y-3 px-5 py-4">
              <div className="flex items-center justify-between">
                <LevelBadge level={n.event} />
                <Button size="sm" variant="outline" onClick={() => pingNode(n.id)}>Ping</Button>
              </div>
              <div>
                <div className="flex justify-between text-xs"><span className="label-caps">Battery</span><span className="readout">{n.battery}%</span></div>
                <Progress value={n.battery} className="mt-1.5 h-1.5" />
              </div>
              <Field label="Position" value={`${n.lat.toFixed(4)}, ${n.lon.toFixed(4)}`} />
              <Field label="Pressure" value={`${fmt(n.pressure, 2)} hPa`} />
              <Field label="Temperature" value={`${fmt(n.temp, 1)} °C`} />
              <Field label="Dominant freq." value={`${fmt(n.freq, 3)} Hz`} />
              <Field label="Link" value={<StatusDot status={n.link} />} />
              <Field label="RSSI / SNR" value={`${n.rssi} dBm / ${fmt(n.snr, 1)} dB`} />
              <Field label="Packets / lost" value={`${n.packets.toLocaleString()} / ${n.lost}`} />
              <Field label="Last packet" value={clock(n.lastPacket)} />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
