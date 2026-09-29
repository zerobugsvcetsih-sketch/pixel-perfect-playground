import { Button } from "@/components/ui/button";
import { Panel } from "@/components/kit";
import { useSystem } from "@/lib/sim/store";
import type { Scenario } from "@/lib/sim/engine";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FlaskConical } from "lucide-react";

const OPTIONS: { key: Scenario; label: string; tone: string }[] = [
  { key: "normal", label: "Simulate Normal", tone: "ring-ok/40 text-ok" },
  { key: "event", label: "Simulate Pressure Event", tone: "ring-watch/40 text-watch" },
  { key: "warning", label: "Simulate Warning", tone: "ring-warning/40 text-warning" },
  { key: "critical", label: "Simulate Critical Event", tone: "ring-critical/40 text-critical" },
];

export function ScenarioBar() {
  const { scenario, setScenario, triggerAlert, activeLanguage } = useSystem();

  return (
    <Panel className="flex flex-wrap items-center gap-3 p-3 sm:px-4">
      <div className="flex items-center gap-2">
        <FlaskConical className="size-4 text-instrument" />
        <p className="label-caps">Demo scenario generator</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <Button
            key={o.key}
            size="sm"
            variant={scenario === o.key ? "secondary" : "outline"}
            className={cn("h-8 text-xs", scenario === o.key && `ring-1 ${o.tone}`)}
            onClick={() => {
              setScenario(o.key);
              if (o.key === "critical") {
                triggerAlert("CRITICAL");
                toast.warning("DEMO: critical event injected", {
                  description: `Siren TRIGGERED (simulated) · voice alert in ${activeLanguage.name}`,
                });
              } else if (o.key === "warning") {
                triggerAlert("WARNING");
                toast("DEMO: warning pattern injected");
              } else if (o.key === "event") {
                toast("DEMO: pressure event injected");
              } else {
                toast.success("DEMO: returned to nominal conditions");
              }
            }}
          >
            {o.label}
          </Button>
        ))}
      </div>
      <p className="ml-auto text-[11px] text-muted-foreground">
        Simulation only — demo controls never actuate real hardware.
      </p>
    </Panel>
  );
}
