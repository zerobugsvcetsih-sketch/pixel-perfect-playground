import { createFileRoute } from "@tanstack/react-router";
import { DemoTag, Disclaimer, Field, PageHeader, Panel, PanelHead } from "@/components/kit";
import { useSystem } from "@/lib/sim/store";
import { LANGUAGES, audioAvailable, type VoiceLevel } from "@/lib/voice";
import { pageMeta } from "@/lib/meta";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AudioLines, Play, Square } from "lucide-react";

export const Route = createFileRoute("/voice")({
  head: () => pageMeta("Voice Center", "Multilingual voice alert messages for Indian regional languages, with preview playback."),
  component: Voice,
});

const LV: VoiceLevel[] = ["WATCH", "WARNING", "CRITICAL"];

function Voice() {
  const s = useSystem();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Communication"
        title="Voice center"
        description="Alert messages are spoken in the language of the node's region. Preview any message below."
      />
      <Panel>
        <PanelHead icon={<AudioLines className="size-4" />} title="Language selection" right={<DemoTag />} />
        <div className="grid gap-4 p-5 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <Switch checked={s.autoLanguage} onCheckedChange={s.setAutoLanguage} />
            <span className="text-sm">Auto from location ({s.location.state})</span>
          </div>
          <Select value={s.manualLanguage} onValueChange={s.setManualLanguage} disabled={s.autoLanguage}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>{l.name} · {l.native}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center justify-between gap-2">
            <Field label="Active" value={s.activeLanguage.name} />
            <Button size="sm" variant="outline" onClick={s.stopVoice}><Square className="size-3" /> Stop</Button>
          </div>
        </div>
      </Panel>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LANGUAGES.map((l) => (
          <Panel key={l.code} className={l.code === s.activeLanguage.code ? "ring-2 ring-instrument" : ""}>
            <PanelHead title={`${l.name} · ${l.native}`} sub={l.regions.join(", ") || "Fallback"} />
            <div className="space-y-3 p-4">
              {LV.map((lv) => (
                <div key={lv} className="flex items-start gap-3">
                  <Button size="icon" variant="outline" className="size-7 shrink-0" onClick={() => s.playVoice(l.code, lv)} aria-label={`Play ${l.name} ${lv}`}>
                    <Play className="size-3" />
                  </Button>
                  <div>
                    <p className="label-caps">{lv} · {audioAvailable(l.code, lv) ? "recording" : "browser voice"}</p>
                    <p className="text-xs leading-relaxed">{l.messages[lv]}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
      <Disclaimer>Browser voices vary by device; some languages may be read with an English voice if not installed.</Disclaimer>
    </div>
  );
}
