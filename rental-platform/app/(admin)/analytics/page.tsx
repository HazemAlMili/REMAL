"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useReports } from "@/lib/hooks/useReports";
import { BookingsFunnelChart } from "@/components/admin/analytics/BookingsFunnelChart";
import { DailyRevenueTable } from "@/components/admin/analytics/DailyRevenueTable";
import { DailyBookingsTable } from "@/components/admin/analytics/DailyBookingsTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils/format";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  FileText,
  CreditCard,
} from "lucide-react";

const RevenueLineChart = dynamic(
  () =>
    import("@/components/admin/dashboard/RevenueLineChart").then((m) => ({
      default: m.RevenueLineChart,
    })),
  {
    ssr: false,
    loading: () => <Skeleton height={300} className="rounded-lg" />,
  }
);

interface DateRange {
  from?: Date;
  to?: Date;
}

export default function AnalyticsPage() {
  const { canViewReports } = usePermissions();

  // Default: current month
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  // Suppress unused warning - setDateRange will be used when date picker is implemented
  void setDateRange;

  const effectiveFrom = dateRange.from ?? startOfMonth(new Date());
  const effectiveTo = dateRange.to ?? endOfMonth(new Date());

  const dateFrom = format(effectiveFrom, "yyyy-MM-dd");
  const dateTo = format(effectiveTo, "yyyy-MM-dd");

  const {
    useFinanceSummary,
    useFinanceDaily,
    useBookingsSummary,
    useBookingsDaily,
  } = useReports();

  const { data: financeSummary, isLoading: summaryLoading } = useFinanceSummary(
    { dateFrom, dateTo }
  );

  const { data: financeDaily, isLoading: financeDailyLoading } =
    useFinanceDaily({ dateFrom, dateTo });

  const { data: bookingsSummary, isLoading: bookingsSummaryLoading } =
    useBookingsSummary({ dateFrom, dateTo });

  const { data: bookingsDaily, isLoading: bookingsDailyLoading } =
    useBookingsDaily({ dateFrom, dateTo });

  if (!canViewReports) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-800">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            You don&apos;t have permission to view analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with date range picker */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Analytics</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Detailed insights and performance metrics
          </p>
        </div>

        {/* Simple date range display - full picker would be in a real implementation */}
        <div className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm">
          <span className="text-neutral-600">
            {format(effectiveFrom, "MMM d, yyyy")} →{" "}
            {format(effectiveTo, "MMM d, yyyy")}
          </span>
        </div>
      </div>

      {/* Revenue summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))
        ) : financeSummary ? (
          <>
            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <DollarSign className="h-5 w-5 text-neutral-500" />
                <span className="text-2xl font-semibold text-neutral-900">
                  {formatCurrency(financeSummary.totalInvoicedAmount)}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">Total Invoiced</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-neutral-500" />
                <span className="text-2xl font-semibold text-neutral-900">
                  {formatCurrency(financeSummary.totalPaidAmount)}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">Total Paid</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <TrendingDown className="h-5 w-5 text-neutral-500" />
                <span className="text-2xl font-semibold text-neutral-900">
                  {formatCurrency(financeSummary.totalRemainingAmount)}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">Total Remaining</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <Wallet className="h-5 w-5 text-neutral-500" />
                <span className="text-2xl font-semibold text-neutral-900">
                  {formatCurrency(financeSummary.totalPendingPayoutAmount)}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">Pending Payout</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <Calendar className="h-5 w-5 text-neutral-500" />
                <span className="text-2xl font-semibold text-neutral-900">
                  {formatCurrency(financeSummary.totalScheduledPayoutAmount)}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">Scheduled Payout</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <CreditCard className="h-5 w-5 text-neutral-500" />
                <span className="text-2xl font-semibold text-neutral-900">
                  {formatCurrency(financeSummary.totalPaidPayoutAmount)}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">Paid Payout</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <FileText className="h-5 w-5 text-neutral-500" />
                <span className="text-2xl font-semibold text-neutral-900">
                  {financeSummary.totalBookingsWithInvoiceCount}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">
                Bookings With Invoice
              </p>
            </div>
          </>
        ) : null}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueLineChart
          data={financeDaily ?? []}
          isLoading={financeDailyLoading}
        />
        <BookingsFunnelChart
          data={bookingsSummary}
          isLoading={bookingsSummaryLoading}
        />
      </div>

      {/* Daily Revenue Table */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-neutral-800">
          Daily Revenue Breakdown
        </h2>
        <DailyRevenueTable
          data={financeDaily ?? []}
          isLoading={financeDailyLoading}
        />
      </div>

      {/* Daily Bookings Table */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-neutral-800">
          Daily Bookings Breakdown
        </h2>
        <DailyBookingsTable
          data={bookingsDaily ?? []}
          isLoading={bookingsDailyLoading}
        />
      </div>
    </div>
  );
}
