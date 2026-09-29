import { createFileRoute } from "@tanstack/react-router";
import { DemoTag, Disclaimer, Field, LevelBadge, PageHeader, Panel, PanelHead, StatusDot, clock } from "@/components/kit";
import { useSystem } from "@/lib/sim/store";
import { pageMeta } from "@/lib/meta";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Megaphone } from "lucide-react";

export const Route = createFileRoute("/alerts")({
  head: () => pageMeta("Local Alert System", "Siren and voice speaker controller for local hazard alerts, with manual test controls."),
  component: Alerts,
});

function Alerts() {
  const { alert, triggerAlert, resetAlert, testSiren, volume, setVolume, activeLanguage } = useSystem();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Response"
        title="Local alert system"
        description="On-site siren and loudspeaker driven by a DFPlayer module. Use the buttons below to test each level."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHead icon={<Megaphone className="size-4" />} title="Controller status" right={<DemoTag />} />
          <div className="px-5 py-3">
            <Field label="Current level" value={<LevelBadge level={alert.level} size="sm" />} />
            <Field label="Siren" value={<StatusDot status={alert.siren} />} />
            <Field label="Speaker" value={<StatusDot status={alert.speaker} />} />
            <Field label="DFPlayer" value={<StatusDot status={alert.dfplayer} />} />
            <Field label="Language" value={`${activeLanguage.name} (${activeLanguage.native})`} />
            <Field label="Audio source" value={alert.source} />
            <Field label="Last triggered" value={alert.lastTriggered ? clock(alert.lastTriggered) : "—"} />
          </div>
        </Panel>
        <Panel>
          <PanelHead title="Manual controls" />
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => triggerAlert("WATCH")}>Watch</Button>
              <Button variant="outline" onClick={() => triggerAlert("WARNING")}>Warning</Button>
              <Button variant="destructive" onClick={() => triggerAlert("CRITICAL")}>Critical</Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={testSiren}>Test siren (4 s)</Button>
              <Button variant="secondary" onClick={resetAlert}>Reset all</Button>
            </div>
            <div>
              <Field label="Speaker volume" value={`${Math.round(volume * 100)}%`} />
              <Slider className="mt-3" min={0} max={1} step={0.05} value={[volume]} onValueChange={(v) => setVolume(v[0]!)} />
            </div>
            <Disclaimer>No real siren is connected in this demo. Voice uses your browser speech when recordings are unavailable.</Disclaimer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
