import { createFileRoute } from "@tanstack/react-router";
import {
  DemoTag,
  Disclaimer,
  Field,
  PageHeader,
  Panel,
  PanelHead,
  StatusDot,
  clock,
  fmt,
} from "@/components/kit";
import { PressurePanel } from "@/components/PressurePanel";
import { useSystem } from "@/lib/sim/store";
import { Progress } from "@/components/ui/progress";
import { Gauge, Radio, SunMedium, Thermometer, Ruler } from "lucide-react";

export const Route = createFileRoute("/live-sensors")({
  head: () => ({
    meta: [
      { title: "Live Sensors — Microbarometer Console" },
      {
        name: "description",
        content:
          "Primary BMP390 pressure sensor, reference instrument, temperature channel, solar power system and LoRa/ESP-NOW communication readouts.",
      },
      { property: "og:title", content: "Live Sensor Readings" },
      {
        property: "og:description",
        content: "Per-channel instrument status for the microbarometer node. Simulated demo data.",
      },
    ],
  }),
  component: LiveSensors,
});

function LiveSensors() {
  const { latest, nodes, packets, uptimeS } = useSystem();
  const a = nodes[0]!;
  const okPackets = packets.filter((p) => p.status === "OK").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Acquisition"
        title="Live sensor readings"
        description="Per-channel instrument state for the coastal node. Every value below is produced by the demo generator and is labelled accordingly."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <PanelHead
            icon={<Gauge className="size-4" />}
            title="Primary pressure sensor"
            sub="BMP390 · barometric MEMS"
            right={<DemoTag />}
          />
          <div className="px-4 py-3 sm:px-5">
            <p className="readout text-3xl font-semibold">{fmt(latest?.cal, 2)}</p>
            <p className="label-caps mt-1">hPa · calibrated</p>
            <div className="mt-3">
              <Field label="Raw reading" value={`${fmt(latest?.raw, 3)} hPa`} />
              <Field label="Temperature" value={`${fmt(latest?.temp, 2)} °C`} />
              <Field label="Sampling rate" value="1.000 Hz (demo loop)" />
              <Field label="Sensor ID" value="BMP390 / I2C 0x77" />
              <Field label="Status" value={<StatusDot status="ONLINE" />} />
              <Field label="Last update" value={latest ? clock(latest.t) : "—"} />
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHead
            icon={<Ruler className="size-4" />}
            title="Reference pressure sensor"
            sub="Traceable comparison instrument"
            right={<DemoTag />}
          />
          <div className="px-4 py-3 sm:px-5">
            <p className="readout text-3xl font-semibold">{fmt(latest?.ref, 2)}</p>
            <p className="label-caps mt-1">hPa · reference</p>
            <div className="mt-3">
              <Field
                label="Deviation (sensor − ref)"
                value={`${fmt((latest?.cal ?? 0) - (latest?.ref ?? 0), 3)} hPa`}
              />
              <Field label="Reference temperature" value={`${fmt((latest?.temp ?? 0) - 0.2, 2)} °C`} />
              <Field label="Instrument" value="REF-DPI-740 / SN 41822" />
              <Field label="Status" value={<StatusDot status="ONLINE" />} />
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHead
            icon={<Thermometer className="size-4" />}
            title="Temperature channel"
            sub="Used for compensation, not as a hazard input"
            right={<DemoTag />}
          />
          <div className="px-4 py-3 sm:px-5">
            <p className="readout text-3xl font-semibold">{fmt(latest?.temp, 1)}</p>
            <p className="label-caps mt-1">°C</p>
            <div className="mt-3">
              <Field label="Compensation coefficient" value="−0.012 hPa/°C" />
              <Field label="Enclosure" value="Vented, wind-shielded" />
              <Field label="Status" value={<StatusDot status="ONLINE" />} />
            </div>
          </div>
        </Panel>
      </div>

      <PressurePanel height={280} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHead
            icon={<SunMedium className="size-4" />}
            title="Power system"
            sub="Li-ion pack with solar harvesting"
            right={<DemoTag />}
          />
          <div className="px-4 py-3 sm:px-5">
            <div className="mb-3">
              <div className="flex items-baseline justify-between">
                <span className="label-caps">Battery</span>
                <span className="readout text-sm">{a.battery}%</span>
              </div>
              <Progress value={a.battery} className="mt-2 h-1.5" />
            </div>
            <Field label="Battery voltage" value={`${fmt(a.batteryV, 2)} V`} />
            <Field label="Solar input voltage" value={`${fmt(a.solarV, 2)} V`} />
            <Field label="Solar current" value={`${fmt(a.solarA, 2)} A`} />
            <Field label="Charging state" value={a.charging ? "CHARGING" : "DISCHARGING"} />
            <Field label="Node uptime" value={`${Math.floor(uptimeS / 60)} min ${uptimeS % 60} s`} />
            <div className="mt-3">
              <Disclaimer>
                Runtime and consumption figures are demo estimates. Real endurance requires bench
                measurement of the assembled node.
              </Disclaimer>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHead
            icon={<Radio className="size-4" />}
            title="Communication"
            sub="LoRa uplink + ESP-NOW peer link"
            right={<DemoTag />}
          />
          <div className="px-4 py-3 sm:px-5">
            <Field label="LoRa status" value={<StatusDot status={a.link} />} />
            <Field label="ESP-NOW status" value={<StatusDot status={nodes[1]!.link} />} />
            <Field label="Signal strength (RSSI)" value={`${a.rssi} dBm`} />
            <Field label="SNR" value={`${fmt(a.snr, 1)} dB`} />
            <Field label="Packet count" value={a.packets.toLocaleString()} />
            <Field label="Packets lost" value={a.lost.toLocaleString()} />
            <Field label="Session packets OK" value={okPackets} />
            <Field label="Last packet" value={clock(a.lastPacket)} />
            <Field label="Comm. error count" value="7" />
          </div>
        </Panel>
      </div>
    </div>
  );
}
