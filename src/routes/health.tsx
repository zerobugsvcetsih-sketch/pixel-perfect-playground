import { createFileRoute } from "@tanstack/react-router";
import { DemoTag, Field, PageHeader, Panel, PanelHead, StatusDot } from "@/components/kit";
import { useSystem } from "@/lib/sim/store";
import { pageMeta } from "@/lib/meta";
import { Cpu } from "lucide-react";

export const Route = createFileRoute("/health")({
  head: () => pageMeta("System Health", "Hardware and subsystem health checks: MCU, sensors, radio, storage, power and alert hardware."),
  component: Health,
});

function Health() {
  const { nodes, alert, uptimeS } = useSystem();
  const checks = [
    { name: "ESP32 MCU", status: "HEALTHY", detail: "240 MHz · heap 182 kB free" },
    { name: "BMP390 sensor", status: "ONLINE", detail: "I2C 0x77 · 0 read errors" },
    { name: "Reference instrument", status: "ONLINE", detail: "RS-232 · 1 Hz" },
    { name: "LoRa radio", status: nodes[0]!.link, detail: `RSSI ${nodes[0]!.rssi} dBm` },
    { name: "ESP-NOW peer", status: nodes[1]!.link, detail: `RSSI ${nodes[1]!.rssi} dBm` },
    { name: "SD card logger", status: "OK", detail: "3.1 GB free · FAT32" },
    { name: "Solar charger", status: nodes[0]!.charging ? "OK" : "WARNING", detail: `${nodes[0]!.solarV} V in` },
    { name: "DFPlayer audio", status: alert.dfplayer, detail: "32 tracks indexed" },
    { name: "Siren driver", status: alert.siren, detail: "MOSFET relay · 12 V" },
  ];
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Diagnostics" title="System health" description="Self-test results for each subsystem of the coastal node." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {checks.map((c) => (
          <Panel key={c.name} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{c.name}</p>
              <StatusDot status={c.status} />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{c.detail}</p>
          </Panel>
        ))}
      </div>
      <Panel>
        <PanelHead icon={<Cpu className="size-4" />} title="Firmware" right={<DemoTag />} />
        <div className="grid gap-x-8 px-5 py-3 md:grid-cols-2">
          <Field label="Firmware version" value="mbar-node v0.9.4" />
          <Field label="Build" value="2026-09-20" />
          <Field label="Session uptime" value={`${Math.floor(uptimeS / 60)} min`} />
          <Field label="Watchdog resets" value="0" />
        </div>
      </Panel>
    </div>
  );
}
