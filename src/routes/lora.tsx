import { createFileRoute } from "@tanstack/react-router";
import { DemoTag, Field, LevelBadge, PageHeader, Panel, PanelHead, StatusDot, clock, fmt } from "@/components/kit";
import { useSystem } from "@/lib/sim/store";
import { pageMeta } from "@/lib/meta";
import { Button } from "@/components/ui/button";
import { Radio } from "lucide-react";

export const Route = createFileRoute("/lora")({
  head: () => pageMeta("LoRa Link", "Live LoRa packet log, radio parameters and link diagnostics between nodes and gateway."),
  component: Lora,
});

function Lora() {
  const { packets, clearPackets, sendTestPacket, restartComms, nodes } = useSystem();
  const ok = packets.filter((p) => p.status === "OK").length;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Telemetry"
        title="LoRa link"
        description="Packets arrive every 5 seconds in the demo loop. CRC errors are simulated to show link diagnostics."
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={sendTestPacket}>Send test packet</Button>
            <Button size="sm" variant="outline" onClick={clearPackets}>Clear log</Button>
            <Button size="sm" variant="outline" onClick={restartComms}>Restart link</Button>
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <PanelHead icon={<Radio className="size-4" />} title="Radio configuration" right={<DemoTag />} />
          <div className="px-5 py-3">
            <Field label="Module" value="SX1276 (RA-02)" />
            <Field label="Frequency" value="865.0625 MHz (IN865)" />
            <Field label="Spreading factor" value="SF9" />
            <Field label="Bandwidth" value="125 kHz" />
            <Field label="Coding rate" value="4/5" />
            <Field label="TX power" value="17 dBm" />
            <Field label="Link A" value={<StatusDot status={nodes[0]!.link} />} />
            <Field label="Link B" value={<StatusDot status={nodes[1]!.link} />} />
            <Field label="Session success" value={packets.length ? `${fmt((ok / packets.length) * 100, 1)} %` : "—"} />
          </div>
        </Panel>
        <Panel className="lg:col-span-2">
          <PanelHead title="Packet log" sub={`${packets.length} packets this session`} />
          <div className="max-h-[480px] overflow-auto">
            <table className="w-full text-xs">
              <thead className="label-caps sticky top-0 bg-panel text-left">
                <tr className="[&_th]:px-3 [&_th]:py-2"><th>#</th><th>Time</th><th>Node</th><th>hPa</th><th>RSSI</th><th>Level</th><th>Status</th></tr>
              </thead>
              <tbody className="readout">
                {packets.map((p) => (
                  <tr key={p.id} className="border-t border-border [&_td]:px-3 [&_td]:py-1.5">
                    <td>{p.id}</td><td>{clock(p.t)}</td><td>{p.node}</td><td>{fmt(p.pressure, 2)}</td><td>{p.rssi}</td>
                    <td><LevelBadge level={p.event} size="sm" /></td><td><StatusDot status={p.status} /></td>
                  </tr>
                ))}
                {!packets.length && (
                  <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Waiting for packets…</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
