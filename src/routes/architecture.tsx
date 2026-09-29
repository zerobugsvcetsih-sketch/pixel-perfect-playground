import { createFileRoute } from "@tanstack/react-router";
import { FlowChain, PageHeader, Panel, PanelHead } from "@/components/kit";
import { pageMeta } from "@/lib/meta";
import { Workflow } from "lucide-react";

export const Route = createFileRoute("/architecture")({
  head: () => pageMeta("Architecture", "System architecture of the microbarometer early-warning node, from sensor to local alert."),
  component: Architecture,
});

const CHAIN = [
  { title: "BMP390 sensor", detail: "Barometric pressure + temperature at 1 Hz" },
  { title: "Calibration", detail: "Offset, gain and temperature correction" },
  { title: "Filtering", detail: "Detrend and band-pass 0.01–0.5 Hz" },
  { title: "Feature extraction", detail: "Change rate, RMS, FFT band energy" },
  { title: "Detection", detail: "Multi-criteria scoring with cross-node check" },
  { title: "Communication", detail: "LoRa to gateway, ESP-NOW to peer" },
  { title: "Local alert", detail: "Siren + regional-language voice" },
];

const HW = [
  ["Microcontroller", "ESP32-WROOM-32"],
  ["Pressure sensor", "Bosch BMP390"],
  ["Radio", "SX1276 LoRa, 865 MHz"],
  ["Audio", "DFPlayer Mini + 10 W speaker"],
  ["Siren", "12 V piezo via MOSFET"],
  ["Power", "18650 pack + 6 V solar panel"],
  ["Storage", "microSD logger"],
];

function Architecture() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Design" title="System architecture" description="How a pressure reading becomes a local alert." />
      <Panel>
        <PanelHead icon={<Workflow className="size-4" />} title="Signal chain" />
        <div className="p-5"><FlowChain steps={CHAIN} orientation="horizontal" /></div>
      </Panel>
      <Panel>
        <PanelHead title="Hardware bill of materials" />
        <div className="divide-y divide-border">
          {HW.map(([k, v]) => (
            <div key={k} className="flex justify-between px-5 py-2 text-sm">
              <span className="text-muted-foreground">{k}</span><span className="readout">{v}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
