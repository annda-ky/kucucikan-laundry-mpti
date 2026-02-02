"use client";

import { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface DataPoint {
  name: string;
  income: number;
  expense: number;
}

interface AmFinanceChartProps {
  data: DataPoint[];
  title?: string;
  className?: string;
  isDark?: boolean;
}

export function AmFinanceChart({
  data,
  title,
  className,
  isDark = true, // Default to dark for this use case
}: AmFinanceChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = am5.Root.new(chartRef.current as HTMLElement);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: root.verticalLayout,
      }),
    );

    // Add legend
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        marginTop: 15,
        marginBottom: 15,
      }),
    );

    legend.labels.template.setAll({
      fill: isDark ? am5.color(0xffffff) : am5.color(0x000000),
      fontSize: 12,
    });

    // Create axes
    const xRenderer = am5xy.AxisRendererX.new(root, {
      cellStartLocation: 0.1,
      cellEndLocation: 0.9,
      minGridDistance: 30,
    });

    xRenderer.labels.template.setAll({
      fill: isDark ? am5.color(0x9ca3af) : am5.color(0x6b7280),
      fontSize: 12,
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "name",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      }),
    );

    xAxis.data.setAll(data);

    const yRenderer = am5xy.AxisRendererY.new(root, {
      strokeOpacity: 0.1,
    });

    yRenderer.labels.template.setAll({
      fill: isDark ? am5.color(0x9ca3af) : am5.color(0x6b7280),
      fontSize: 12,
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: yRenderer,
        numberFormat: "#.0a",
      }),
    );

    // Add series
    function makeSeries(name: string, fieldName: string, color: number) {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: fieldName,
          categoryXField: "name",
        }),
      );

      series.columns.template.setAll({
        tooltipText: "{name}: {valueY}",
        width: am5.percent(90),
        tooltipY: 0,
        strokeOpacity: 0,
        fill: am5.color(color),
      });

      series.data.setAll(data);

      series.appear();

      legend.data.push(series);
    }

    makeSeries("Pemasukan", "income", 0x22c55e); // Green
    makeSeries("Pengeluaran", "expense", 0xef4444); // Red

    // Make stuff animate on load
    chart.appear(1000, 100);

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
        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
          {title}
        </h3>
      )}
      <div ref={chartRef} className="h-[300px] w-full" />
    </div>
  );
}
