import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  AudioLines,
  BadgeCheck,
  Cpu,
  Gauge,
  History,
  LayoutDashboard,
  Megaphone,
  Menu,
  Network,
  Radio,
  Settings,
  ShieldAlert,
  Waves,
  Workflow,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSystem } from "@/lib/sim/store";
import { LevelBadge } from "@/components/kit";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/live-sensors", label: "Live Sensors", icon: Gauge },
  { to: "/signal-analysis", label: "Signal Analysis", icon: Waves },
  { to: "/calibration", label: "Calibration", icon: BadgeCheck },
  { to: "/danger", label: "Danger Detection", icon: ShieldAlert },
  { to: "/nodes", label: "Node Network", icon: Network },
  { to: "/lora", label: "LoRa Link", icon: Radio },
  { to: "/alerts", label: "Local Alert System", icon: Megaphone },
  { to: "/voice", label: "Voice Center", icon: AudioLines },
  { to: "/validation", label: "Validation", icon: Activity },
  { to: "/history", label: "Event History", icon: History },
  { to: "/health", label: "System Health", icon: Cpu },
  { to: "/architecture", label: "Architecture", icon: Workflow },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className={cn("size-4", active ? "text-sidebar-primary" : "opacity-70")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="border-b border-sidebar-border px-4 py-4">
      <p className="font-mono text-[10px] tracking-[0.18em] text-sidebar-primary">SIH 2026 · MBS-01</p>
      <p className="mt-1 text-sm font-semibold leading-snug text-sidebar-accent-foreground">
        Multi-Parameter Microbarometer
      </p>
      <p className="mt-0.5 text-[11px] text-sidebar-foreground/60">
        Infrasound Event Detection System
      </p>
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="readout text-xs tabular-nums">{now ?? "--:--:--"}</span>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { detection, location, nodes, demoMode } = useSystem();
  const [open, setOpen] = useState(false);
  const linkOk = nodes.every((n) => n.link === "CONNECTED");

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto bg-sidebar lg:flex">
        <Brand />
        <NavList />
        <div className="mt-auto border-t border-sidebar-border p-4">
          <p className="font-mono text-[10px] leading-relaxed tracking-wider text-sidebar-foreground/55">
            PROTOTYPE · NOT AN OFFICIAL WARNING SERVICE
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        {demoMode ? (
          <div className="flex items-center justify-center gap-2 bg-warning/15 px-4 py-1.5 text-center font-mono text-[11px] font-medium tracking-[0.14em] text-warning">
            DEMO MODE — SIMULATED SENSOR DATA · NO HARDWARE CONNECTED
          </div>
        ) : null}

        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border bg-panel/90 px-4 py-2.5 backdrop-blur sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <NavList onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="mr-auto flex items-center gap-2">
            <LevelBadge level={detection.level} size="sm" />
            <span className="hidden text-xs text-muted-foreground sm:inline">System status</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", linkOk ? "bg-ok" : "bg-watch")} />
              <span className="readout">{linkOk ? "LINK OK" : "LINK DEGRADED"}</span>
            </span>
            <span className="hidden sm:inline">
              {location.district}, {location.state}
            </span>
            <Clock />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>

        <footer className="border-t border-border px-4 py-6 text-center sm:px-6">
          <p className="font-mono text-xs tracking-[0.18em] text-instrument">
            MEASURE. CALIBRATE. ANALYZE. VALIDATE. ALERT.
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-[11px] leading-relaxed text-muted-foreground">
            A multi-parameter edge sensing platform for atmospheric pressure fluctuation analysis,
            spectral characterization, distributed validation and localized multilingual warning.
          </p>
        </footer>
      </div>
    </div>
  );
}
