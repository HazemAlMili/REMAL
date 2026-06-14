"use client";

import { useState } from "react";
import { RevenueTable } from "@/components/admin/finance/RevenueTable";
import { BookingsAnalyticsTable } from "@/components/admin/finance/BookingsAnalyticsTable";
import { format } from "date-fns";
import {
  ReportRangeFilter,
  DEFAULT_REPORT_RANGE,
  type ReportRangeValue,
} from "@/components/admin/analytics/ReportRangeFilter";
import { useReports } from "@/lib/hooks/useReports";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { ROUTES } from "@/lib/constants/routes";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type ReportTab = "revenue" | "bookings";

export default function FinanceReportsPage() {
  const { canViewReports } = usePermissions();

  if (canViewReports === false) {
    redirect(ROUTES.admin.dashboard);
  }

  const [activeTab, setActiveTab] = useState<ReportTab>("revenue");
  const [range, setRange] = useState<ReportRangeValue>(DEFAULT_REPORT_RANGE);

  // All-time (null bounds) sends no date params, so the API returns every period.
  const filters = {
    dateFrom: range.from ? format(range.from, "yyyy-MM-dd") : undefined,
    dateTo: range.to ? format(range.to, "yyyy-MM-dd") : undefined,
  };

  const { useFinanceDaily, useBookingsDaily } = useReports();

  const { data: financeDaily, isLoading: financeLoading } = useFinanceDaily(filters);
  const { data: bookingsDaily, isLoading: bookingsLoading } = useBookingsDaily(filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Finance reports
          </h1>
          <p className="text-sm text-neutral-500">
            Compare daily revenue and booking volume for the selected period.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <ReportRangeFilter value={range} onChange={setRange} />
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-neutral-200">
        <button
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "revenue"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          )}
          onClick={() => setActiveTab("revenue")}
        >
          Revenue
        </button>
        <button
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "bookings"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          )}
          onClick={() => setActiveTab("bookings")}
        >
          Bookings
        </button>
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {activeTab === "revenue" && (
          <RevenueTable data={financeDaily ?? []} isLoading={financeLoading} />
        )}
        {activeTab === "bookings" && (
          <BookingsAnalyticsTable
            data={bookingsDaily ?? []}
            isLoading={bookingsLoading}
          />
        )}
      </div>
    </div>
  );
}
