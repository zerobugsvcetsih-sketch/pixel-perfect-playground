import { createFileRoute } from "@tanstack/react-router";
import { Disclaimer, Field, PageHeader, Panel, PanelHead } from "@/components/kit";
import { useSystem } from "@/lib/sim/store";
import { DISTRICTS, STATES } from "@/lib/voice";
import { pageMeta } from "@/lib/meta";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => pageMeta("Settings", "Configure node location, sampling rate and regional language for the microbarometer console."),
  component: SettingsPage,
});

function SettingsPage() {
  const { location, setLocation, sampleRate, setSampleRate, activeLanguage } = useSystem();
  const districts = DISTRICTS[location.state] ?? [];
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Configuration" title="Settings" description="Node location decides the alert language. Changes apply immediately." />
      <Panel>
        <PanelHead icon={<SettingsIcon className="size-4" />} title="Node location" />
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>State</Label>
            <Select value={location.state} onValueChange={(v) => setLocation({ ...location, state: v, district: DISTRICTS[v]?.[0] ?? "" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>District</Label>
            {districts.length ? (
              <Select value={location.district} onValueChange={(v) => setLocation({ ...location, district: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              <Input value={location.district} onChange={(e) => setLocation({ ...location, district: e.target.value })} />
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Latitude</Label>
            <Input value={location.lat} onChange={(e) => setLocation({ ...location, lat: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Longitude</Label>
            <Input value={location.lon} onChange={(e) => setLocation({ ...location, lon: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Field label="Alert language for this location" value={`${activeLanguage.name} · ${activeLanguage.native}`} />
          </div>
        </div>
      </Panel>
      <Panel>
        <PanelHead title="Acquisition" />
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Sample rate used for FFT (Hz)</Label>
            <Input type="number" min={0.1} step={0.1} value={sampleRate} onChange={(e) => setSampleRate(Number(e.target.value) || 1)} />
          </div>
          <Disclaimer>Settings are kept for this session only in the demo.</Disclaimer>
        </div>
      </Panel>
    </div>
  );
}
