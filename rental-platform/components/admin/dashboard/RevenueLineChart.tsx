"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/Skeleton";
import type { FinanceAnalyticsDailySummaryResponse } from "@/lib/types/report.types";

interface RevenueLineChartProps {
  data: FinanceAnalyticsDailySummaryResponse[];
  isLoading: boolean;
}

export function RevenueLineChart({ data, isLoading }: RevenueLineChartProps) {
  if (isLoading) {
    return <Skeleton height={280} className="rounded-lg" />;
  }

  const chartData = data.map((d) => ({
    date: formatDate(d.metricDate),
    revenue: d.totalInvoicedAmount,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <h3 className="font-medium text-neutral-700 mb-4">
        Revenue — Last 30 Days
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-neutral-200)"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--color-neutral-400)" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-neutral-400)" }}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), "Revenue"]}
            contentStyle={{
              backgroundColor: "var(--color-neutral-800)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "13px",
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-primary-500)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
