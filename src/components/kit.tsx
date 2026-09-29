import { cn } from "@/lib/utils";
import { LEVEL_META, type DangerLevel } from "@/lib/sim/engine";
import { AlertTriangle, Info } from "lucide-react";
import type { ReactNode } from "react";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <section className={cn("panel", className)}>{children}</section>;
}

export function PanelHead({
  title,
  sub,
  right,
  icon,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
      <div className="flex items-start gap-3">
        {icon ? <span className="mt-0.5 text-instrument">{icon}</span> : null}
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
        </div>
      </div>
      {right}
    </header>
  );
}

export function DemoTag({ label = "DEMO", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-instrument/40 bg-instrument-soft px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-[0.14em] text-instrument",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div className="max-w-3xl">
        <p className="label-caps">{eyebrow}</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-[1.7rem]">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {actions}
    </div>
  );
}

export function Metric({
  label,
  value,
  unit,
  sub,
  tone = "default",
  demo = true,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  tone?: "default" | "ok" | "watch" | "warning" | "critical";
  demo?: boolean;
  icon?: ReactNode;
}) {
  const toneText = {
    default: "text-foreground",
    ok: "text-ok",
    watch: "text-watch",
    warning: "text-warning",
    critical: "text-critical",
  }[tone];
  return (
    <Panel className="relative overflow-hidden p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="label-caps">{label}</p>
        {demo ? <DemoTag /> : null}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        {icon ? <span className="mr-1 text-instrument">{icon}</span> : null}
        <span className={cn("readout text-2xl font-semibold sm:text-[1.6rem]", toneText)}>
          {value}
        </span>
        {unit ? <span className="readout text-xs text-muted-foreground">{unit}</span> : null}
      </div>
      {sub ? <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p> : null}
    </Panel>
  );
}

export function LevelBadge({
  level,
  size = "md",
}: {
  level: DangerLevel;
  size?: "sm" | "md" | "lg";
}) {
  const m = LEVEL_META[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-mono font-medium uppercase tracking-[0.12em] ring-1",
        m.bg,
        m.text,
        m.ring,
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-2.5 py-1 text-xs",
        size === "lg" && "px-4 py-2 text-sm",
        level === "CRITICAL" && size === "lg" && "alert-pulse",
      )}
    >
      <span className={cn("size-1.5 rounded-full", `bg-current`)} />
      {level}
    </span>
  );
}

export function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    ONLINE: "bg-ok",
    CONNECTED: "bg-ok",
    HEALTHY: "bg-ok",
    OK: "bg-ok",
    READY: "bg-ok",
    PLAYING: "bg-instrument",
    WEAK: "bg-watch",
    WARNING: "bg-watch",
    "CRC-ERR": "bg-warning",
    TRIGGERED: "bg-critical",
    ERROR: "bg-critical",
    OFFLINE: "bg-muted-foreground",
    DISCONNECTED: "bg-critical",
    LOST: "bg-critical",
  };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full", map[status] ?? "bg-muted-foreground")} />
      <span className="readout text-xs">{status}</span>
    </span>
  );
}

export function Field({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/70 py-1.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-sm", mono && "readout")}>{value}</span>
    </div>
  );
}

export function Disclaimer({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "warn";
}) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-xs leading-relaxed",
        tone === "info"
          ? "border-instrument/30 bg-instrument-soft text-instrument"
          : "border-warning/35 bg-warning/10 text-warning",
      )}
    >
      {tone === "info" ? (
        <Info className="mt-0.5 size-3.5 shrink-0" />
      ) : (
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
      )}
      <span>{children}</span>
    </p>
  );
}

/** Vertical / horizontal signal-chain diagram with animated flow connectors. */
export function FlowChain({
  steps,
  orientation = "vertical",
  active,
}: {
  steps: { title: string; detail?: string }[];
  orientation?: "vertical" | "horizontal";
  active?: number;
}) {
  return (
    <ol
      className={cn(
        "flex gap-0",
        orientation === "vertical" ? "flex-col" : "flex-row flex-wrap items-stretch",
      )}
    >
      {steps.map((s, i) => (
        <li
          key={s.title}
          className={cn(
            "relative",
            orientation === "vertical" ? "pb-6 pl-7 last:pb-0" : "flex-1 min-w-[150px] pr-6",
          )}
        >
          {orientation === "vertical" ? (
            <>
              <span
                className={cn(
                  "absolute left-0 top-1 size-3.5 rounded-full border-2 bg-panel",
                  active !== undefined && i <= active
                    ? "border-instrument"
                    : "border-border",
                )}
              />
              {i < steps.length - 1 ? (
                <svg className="absolute left-[6px] top-5 h-[calc(100%-1rem)] w-px overflow-visible">
                  <line
                    x1="0.5"
                    y1="0"
                    x2="0.5"
                    y2="100%"
                    className="flow-line stroke-instrument/60"
                    strokeWidth="1.5"
                  />
                </svg>
              ) : null}
            </>
          ) : (
            i < steps.length - 1 && (
              <svg className="absolute right-1 top-4 h-px w-5 overflow-visible">
                <line
                  x1="0"
                  y1="0.5"
                  x2="100%"
                  y2="0.5"
                  className="flow-line stroke-instrument/60"
                  strokeWidth="1.5"
                />
              </svg>
            )
          )}
          <div
            className={cn(
              orientation === "horizontal" &&
                "h-full rounded-md border border-border bg-secondary/60 p-3",
            )}
          >
            <p className="text-xs font-semibold tracking-tight">{s.title}</p>
            {s.detail ? (
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{s.detail}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function fmt(n: number | undefined, digits = 2) {
  if (n === undefined || Number.isNaN(n)) return "—";
  return n.toFixed(digits);
}

export function clock(t: number) {
  return new Date(t).toLocaleTimeString("en-GB", { hour12: false });
}
