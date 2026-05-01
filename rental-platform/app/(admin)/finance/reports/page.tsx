"use client";

import { useState } from "react";
import { RevenueTable } from "@/components/admin/finance/RevenueTable";
import { BookingsAnalyticsTable } from "@/components/admin/finance/BookingsAnalyticsTable";
import {
  DateRangePicker,
  type DateRange,
} from "@/components/ui/DateRangePicker";
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

  // Default to current month
  const getDefaultDateRange = (): DateRange => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from, to };
  };

  const [activeTab, setActiveTab] = useState<ReportTab>("revenue");
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());

  const filters = {
    dateFrom: dateRange.from ? dateRange.from.toISOString().split("T")[0] : undefined,
    dateTo: dateRange.to ? dateRange.to.toISOString().split("T")[0] : undefined,
  };

  const { useFinanceDaily, useBookingsDaily } = useReports();

  const { data: financeDaily, isLoading: financeLoading } = useFinanceDaily(filters);
  const { data: bookingsDaily, isLoading: bookingsLoading } = useBookingsDaily(filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance Reports</h1>
          <p className="text-muted-foreground">
            Daily breakdowns of revenue and booking performance.
          </p>
        </div>
        <div className="w-full max-w-xs">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder="Select period"
          />
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
