"use client";

import { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface DataPoint {
  name: string;
  value: number;
}

interface AmPieChartProps {
  data: DataPoint[];
  title?: string;
  className?: string;
  isDark?: boolean;
}

export function AmPieChart({
  data,
  title,
  className,
  isDark = false,
}: AmPieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = am5.Root.new(chartRef.current as HTMLElement);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(50),
      }),
    );

    // Series
    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "name",
        alignLabels: false,
      }),
    );

    series.labels.template.setAll({
      forceHidden: true,
    });

    series.ticks.template.setAll({
      forceHidden: true,
    });

    series.slices.template.setAll({
      stroke: isDark ? am5.color(0x1a1a1a) : am5.color(0xffffff),
      strokeWidth: 2,
    });

    // Custom coloring if needed, or rely on auto
    series
      .get("colors")
      ?.set("colors", [
        am5.color(0xc5a059),
        am5.color(0xe5e2d9),
        am5.color(0xa19e95),
        am5.color(0x808080),
        am5.color(0x2a2a2a),
      ]);

    // Legend
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 15,
        marginBottom: 15,
        layout: root.horizontalLayout,
      }),
    );

    legend.labels.template.setAll({
      fill: isDark ? am5.color(0xffffff) : am5.color(0x000000),
      fontSize: 12,
    });

    legend.valueLabels.template.setAll({
      fill: isDark ? am5.color(0xa19e95) : am5.color(0x808080),
      fontSize: 12,
    });

    legend.data.setAll(series.dataItems);

    // Play initial animation
    series.appear(1000, 100);

    // Set data
    series.data.setAll(data);

    // Prepare for clean up
    return () => {
      root.dispose();
    };
  }, [data, isDark]);

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
      <div ref={chartRef} className="h-[300px] w-full" />
    </div>
  );
}
