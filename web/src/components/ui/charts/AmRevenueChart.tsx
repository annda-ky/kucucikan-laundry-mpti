"use client";

import { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface DataPoint {
  name: string;
  value: number;
}

interface AmRevenueChartProps {
  data: DataPoint[];
  title?: string;
  className?: string;
  barColor?: string;
  isDark?: boolean;
}

export function AmRevenueChart({
  data,
  title,
  className,
  barColor = "#C5A059",
  isDark = false,
}: AmRevenueChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = am5.Root.new(chartRef.current as HTMLElement);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: root.verticalLayout,
      }),
    );

    // Cursor
    const cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "zoomX",
      }),
    );
    cursor.lineY.set("visible", false);

    // Axes
    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 30,
      minorGridEnabled: true,
    });

    xRenderer.labels.template.setAll({
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 15,
      fill: isDark ? am5.color(0x9ca3af) : am5.color(0x6b7280),
      fontSize: 10,
    });

    xRenderer.grid.template.setAll({
      location: 1,
      stroke: isDark ? am5.color(0x374151) : am5.color(0xe5e7eb),
      strokeOpacity: 0.5,
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0.3,
        categoryField: "name",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      }),
    );

    const yRenderer = am5xy.AxisRendererY.new(root, {
      strokeOpacity: 0.1,
    });

    yRenderer.labels.template.setAll({
      fill: isDark ? am5.color(0x9ca3af) : am5.color(0x6b7280),
      fontSize: 10,
    });

    yRenderer.grid.template.setAll({
      stroke: isDark ? am5.color(0x374151) : am5.color(0xe5e7eb),
      strokeOpacity: 0.5,
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0.3,
        renderer: yRenderer,
      }),
    );

    // Series
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Revenue",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "name",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueY.formatNumber('#,###.0a')}",
        }),
      }),
    );

    series.columns.template.setAll({
      cornerRadiusTL: 5,
      cornerRadiusTR: 5,
      strokeOpacity: 0,
      fill: am5.color(barColor),
      width: am5.percent(70),
    });

    // Make stuff animate on load
    series.appear(1000);
    chart.appear(1000, 100);

    // Set data
    xAxis.data.setAll(data);
    series.data.setAll(data);

    // Prepare for clean up
    return () => {
      root.dispose();
    };
  }, [data, isDark, barColor]);

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
