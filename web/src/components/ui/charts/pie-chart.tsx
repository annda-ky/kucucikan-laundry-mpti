"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  name: string;
  value: number;
}

interface ServicePieChartProps {
  data: DataPoint[];
  title?: string;
  className?: string;
  colors?: string[];
  isDark?: boolean;
}

const DEFAULT_COLORS = ["#C5A059", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6"];

export function ServicePieChart({
  data,
  title,
  className,
  colors = DEFAULT_COLORS,
  isDark = false,
}: ServicePieChartProps) {
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
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  stroke={isDark ? "#1A1A1A" : "#fff"}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#2A2A2A" : "#fff",
                borderColor: isDark ? "#333" : "#F0EDE4",
                borderRadius: "4px",
                color: isDark ? "#fff" : "#000",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontSize: "12px",
                color: isDark ? "#A19E95" : "#1A1A1A",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
