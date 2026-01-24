"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DataPoint {
  name: string;
  value: number;
}

interface RevenueBarChartProps {
  data: DataPoint[];
  title?: string;
  className?: string;
  barColor?: string;
  isDark?: boolean;
}

export function RevenueBarChart({
  data,
  title,
  className,
  barColor = "#C5A059",
  isDark = false,
}: RevenueBarChartProps) {
  return (
    <div
      className={`p-6 rounded-sm border ${
        isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-[#F0EDE4]"
      } ${className}`}
    >
      {title && (
        <h3
          className={`text-[12px] font-bold uppercase tracking-[0.2em] mb-6 ${
            isDark ? "text-white" : "text-[#1A1A1A]"
          }`}
        >
          {title}
        </h3>
      )}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? "#333" : "#E5E5E5"}
            />
            <XAxis
              dataKey="name"
              stroke={isDark ? "#808080" : "#A19E95"}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke={isDark ? "#808080" : "#A19E95"}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                new Intl.NumberFormat("id-ID", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value)
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#2A2A2A" : "#fff",
                borderColor: isDark ? "#333" : "#F0EDE4",
                borderRadius: "4px",
                color: isDark ? "#fff" : "#000",
              }}
              formatter={(value: any) =>
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(Number(value))
              }
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={barColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
