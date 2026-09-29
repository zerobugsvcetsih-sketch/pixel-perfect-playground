import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Bin, Sample } from "@/lib/sim/engine";

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 10,
  fontFamily: "var(--font-mono)",
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--panel)",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    fontSize: "11px",
    fontFamily: "var(--font-mono)",
    boxShadow: "var(--shadow-panel)",
  },
  labelStyle: { color: "var(--muted-foreground)", fontSize: "10px" },
};

function time(t: number) {
  return new Date(t).toLocaleTimeString("en-GB", { hour12: false }).slice(0, 5);
}

export function PressureChart({
  data,
  show,
  height = 300,
}: {
  data: Sample[];
  show: { raw: boolean; cal: boolean; ref: boolean };
  height?: number;
}) {
  const rows = data.map((s) => ({ t: s.t, raw: s.raw, cal: s.cal, ref: s.ref }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" />
        <XAxis dataKey="t" tickFormatter={time} {...axis} minTickGap={48} />
        <YAxis
          domain={["auto", "auto"]}
          tickFormatter={(v: number) => v.toFixed(2)}
          width={62}
          {...axis}
        />
        <Tooltip
          {...tooltipStyle}
          labelFormatter={(v: number) => new Date(v).toLocaleTimeString("en-GB", { hour12: false })}
          formatter={(v: number, n: string) => [`${v.toFixed(3)} hPa`, n]}
        />
        {show.raw && (
          <Line
            type="monotone"
            dataKey="raw"
            name="Raw"
            stroke="var(--chart-1)"
            strokeWidth={1.2}
            strokeDasharray="4 3"
            dot={false}
            isAnimationActive={false}
          />
        )}
        {show.cal && (
          <Line
            type="monotone"
            dataKey="cal"
            name="Calibrated"
            stroke="var(--instrument)"
            strokeWidth={1.8}
            dot={false}
            isAnimationActive={false}
          />
        )}
        {show.ref && (
          <Line
            type="monotone"
            dataKey="ref"
            name="Reference"
            stroke="var(--chart-3)"
            strokeWidth={1.2}
            strokeDasharray="1 3"
            dot={false}
            isAnimationActive={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SeriesChart({
  data,
  dataKey,
  color = "var(--instrument)",
  unit,
  height = 190,
  zeroLine = false,
  digits = 2,
}: {
  data: Sample[];
  dataKey: "raw" | "cal" | "filt" | "fluct" | "temp";
  color?: string;
  unit: string;
  height?: number;
  zeroLine?: boolean;
  digits?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" />
        <XAxis dataKey="t" tickFormatter={time} {...axis} minTickGap={48} />
        <YAxis
          domain={["auto", "auto"]}
          tickFormatter={(v: number) => v.toFixed(digits)}
          width={58}
          {...axis}
        />
        <Tooltip
          {...tooltipStyle}
          labelFormatter={(v: number) => new Date(v).toLocaleTimeString("en-GB", { hour12: false })}
          formatter={(v: number) => [`${v.toFixed(3)} ${unit}`, dataKey]}
        />
        {zeroLine && <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeWidth={0.6} />}
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.6}
          fill={`url(#g-${dataKey})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RateChart({ data, height = 190 }: { data: Sample[]; height?: number }) {
  const rows = data.map((s, i, arr) => ({
    t: s.t,
    rate: i === 0 ? 0 : ((s.cal - arr[i - 1]!.cal) * 60000) / Math.max(1, s.t - arr[i - 1]!.t),
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" />
        <XAxis dataKey="t" tickFormatter={time} {...axis} minTickGap={48} />
        <YAxis tickFormatter={(v: number) => v.toFixed(2)} width={58} {...axis} />
        <Tooltip
          {...tooltipStyle}
          labelFormatter={(v: number) => new Date(v).toLocaleTimeString("en-GB", { hour12: false })}
          formatter={(v: number) => [`${v.toFixed(3)} hPa/min`, "ΔP/Δt"]}
        />
        <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeWidth={0.6} />
        <Line
          type="monotone"
          dataKey="rate"
          stroke="var(--chart-4)"
          strokeWidth={1.4}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SpectrumChart({
  bins,
  height = 240,
  markers = [],
}: {
  bins: Bin[];
  height?: number;
  markers?: { f: number; label: string; color: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={bins} margin={{ top: 8, right: 12, left: 0, bottom: 12 }}>
        <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" vertical={false} />
        <XAxis
          dataKey="f"
          tickFormatter={(v: number) => v.toFixed(2)}
          {...axis}
          label={{
            value: "Frequency (Hz)",
            position: "insideBottom",
            offset: -8,
            fontSize: 10,
            fill: "var(--muted-foreground)",
          }}
        />
        <YAxis tickFormatter={(v: number) => v.toFixed(1)} width={54} {...axis} />
        <Tooltip
          {...tooltipStyle}
          labelFormatter={(v: number) => `${Number(v).toFixed(3)} Hz`}
          formatter={(v: number) => [`${v.toFixed(3)} Pa`, "Magnitude"]}
        />
        {markers.map((m) => (
          <ReferenceLine
            key={m.label}
            x={m.f}
            stroke={m.color}
            strokeDasharray="3 3"
            label={{ value: m.label, fontSize: 9, fill: m.color, position: "top" }}
          />
        ))}
        <Bar dataKey="mag" fill="var(--instrument)" isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function XYScatter({
  data,
  xKey,
  yKey,
  xLabel,
  yLabel,
  height = 220,
  color = "var(--chart-1)",
  refLine,
}: {
  data: Record<string, number>[];
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
  height?: number;
  color?: string;
  refLine?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 16, left: 0, bottom: 14 }}>
        <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" />
        <XAxis
          type="number"
          dataKey={xKey}
          domain={["auto", "auto"]}
          tickFormatter={(v: number) => v.toFixed(2)}
          {...axis}
          label={{
            value: xLabel,
            position: "insideBottom",
            offset: -10,
            fontSize: 10,
            fill: "var(--muted-foreground)",
          }}
        />
        <YAxis
          type="number"
          dataKey={yKey}
          domain={["auto", "auto"]}
          tickFormatter={(v: number) => v.toFixed(2)}
          width={58}
          {...axis}
          label={{
            value: yLabel,
            angle: -90,
            position: "insideLeft",
            fontSize: 10,
            fill: "var(--muted-foreground)",
          }}
        />
        <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
        {refLine !== undefined && (
          <ReferenceLine y={refLine} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
        )}
        <Scatter data={data} fill={color} isAnimationActive={false} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function SimpleBar({
  data,
  xKey,
  yKey,
  unit,
  height = 200,
  color = "var(--chart-2)",
}: {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  unit: string;
  height?: number;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" vertical={false} />
        <XAxis dataKey={xKey} {...axis} />
        <YAxis width={48} {...axis} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} ${unit}`, yKey]} />
        <Bar dataKey={yKey} fill={color} radius={[3, 3, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
