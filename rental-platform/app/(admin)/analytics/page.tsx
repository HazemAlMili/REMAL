"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useReports } from "@/lib/hooks/useReports";
import {
  ReportRangeFilter,
  DEFAULT_REPORT_RANGE,
  type ReportRangeValue,
} from "@/components/admin/analytics/ReportRangeFilter";
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

export default function AnalyticsPage() {
  const { canViewReports } = usePermissions();

  const [range, setRange] = useState<ReportRangeValue>(DEFAULT_REPORT_RANGE);

  // All-time (null bounds) sends no date params, so the API returns every period.
  const filters = {
    dateFrom: range.from ? format(range.from, "yyyy-MM-dd") : undefined,
    dateTo: range.to ? format(range.to, "yyyy-MM-dd") : undefined,
  };

  const {
    useFinanceSummary,
    useFinanceDaily,
    useBookingsSummary,
    useBookingsDaily,
  } = useReports();

  const { data: financeSummary, isLoading: summaryLoading } =
    useFinanceSummary(filters);

  const { data: financeDaily, isLoading: financeDailyLoading } =
    useFinanceDaily(filters);

  const { data: bookingsSummary, isLoading: bookingsSummaryLoading } =
    useBookingsSummary(filters);

  const { data: bookingsDaily, isLoading: bookingsDailyLoading } =
    useBookingsDaily(filters);

  const isEmptyPeriod =
    !!financeSummary &&
    financeSummary.totalInvoicedAmount === 0 &&
    financeSummary.totalPaidAmount === 0 &&
    financeSummary.totalBookingsWithInvoiceCount === 0;

  if (!canViewReports) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-800">
            Analytics access required
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Your role cannot view performance reports. Ask a super admin if
            you need this access.
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
          <h1 className="text-2xl font-bold text-neutral-800">
            Performance analytics
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Track revenue, booking movement, and payout totals for the selected
            period.
          </p>
        </div>

        <ReportRangeFilter value={range} onChange={setRange} />
      </div>

      {isEmptyPeriod && !summaryLoading && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No financial activity in this period. Try a wider range like “Last 12
          months” or “All time”.
        </div>
      )}

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
                <span className="text-2xl font-semibold tabular-nums text-neutral-900">
                  {formatCurrency(financeSummary.totalInvoicedAmount)}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">Invoiced amount</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-neutral-500" />
                <span className="text-2xl font-semibold tabular-nums text-neutral-900">
                  {formatCurrency(financeSummary.totalPaidAmount)}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">Paid amount</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <TrendingDown className="h-5 w-5 text-neutral-500" />
                <span className="text-2xl font-semibold tabular-nums text-neutral-900">
                  {formatCurrency(financeSummary.totalRemainingAmount)}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">Unpaid balance</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <Wallet className="h-5 w-5 text-neutral-500" />
                <span className="text-2xl font-semibold tabular-nums text-neutral-900">
                  {formatCurrency(financeSummary.totalPendingPayoutAmount)}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">Pending payouts</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <Calendar className="h-5 w-5 text-neutral-500" />
                <span className="text-2xl font-semibold tabular-nums text-neutral-900">
                  {formatCurrency(financeSummary.totalScheduledPayoutAmount)}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">Scheduled payouts</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <CreditCard className="h-5 w-5 text-neutral-500" />
                <span className="text-2xl font-semibold tabular-nums text-neutral-900">
                  {formatCurrency(financeSummary.totalPaidPayoutAmount)}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">Paid payouts</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <FileText className="h-5 w-5 text-neutral-500" />
                <span className="text-2xl font-semibold tabular-nums text-neutral-900">
                  {financeSummary.totalBookingsWithInvoiceCount}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">
                Bookings with invoices
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
          Daily revenue
        </h2>
        <DailyRevenueTable
          data={financeDaily ?? []}
          isLoading={financeDailyLoading}
        />
      </div>

      {/* Daily Bookings Table */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-neutral-800">
          Daily bookings
        </h2>
        <DailyBookingsTable
          data={bookingsDaily ?? []}
          isLoading={bookingsDailyLoading}
        />
      </div>
    </div>
  );
}
