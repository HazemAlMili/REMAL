"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatDate } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/Skeleton";
import type { BookingAnalyticsDailySummaryResponse } from "@/lib/types/report.types";

interface BookingsBarChartProps {
  data: BookingAnalyticsDailySummaryResponse[];
  isLoading: boolean;
}

export function BookingsBarChart({ data, isLoading }: BookingsBarChartProps) {
  if (isLoading) {
    return <Skeleton height={280} className="rounded-lg" />;
  }

  const chartData = data.map((d) => ({
    date: formatDate(d.metricDate),
    confirmed: d.confirmedBookingsCount,
    completed: d.completedBookingsCount,
    cancelled: d.cancelledBookingsCount,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <h3 className="font-medium text-neutral-700 mb-4">
        Bookings — Last 30 Days
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData}>
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
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-neutral-800)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "13px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
          <Bar
            dataKey="confirmed"
            stackId="a"
            fill="var(--color-primary-500)"
            name="Confirmed"
          />
          <Bar
            dataKey="completed"
            stackId="a"
            fill="var(--color-accent-green)"
            name="Completed"
          />
          <Bar
            dataKey="cancelled"
            fill="var(--color-error)"
            name="Cancelled"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
