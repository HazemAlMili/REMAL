"use client";

import dynamic from "next/dynamic";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { OccupancyWidget } from "@/components/admin/dashboard/OccupancyWidget";
import { TopUnitsWidget } from "@/components/admin/dashboard/TopUnitsWidget";
import { useReports } from "@/lib/hooks/useReports";
import { Building2, Users, CalendarCheck, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { format, subDays } from "date-fns";
import { Skeleton } from "@/components/ui/Skeleton";

const RevenueLineChart = dynamic(
  () =>
    import("@/components/admin/dashboard/RevenueLineChart").then((m) => ({
      default: m.RevenueLineChart,
    })),
  {
    ssr: false,
    loading: () => <Skeleton height={300} className="rounded-[4px]" />,
  }
);

const BookingsBarChart = dynamic(
  () =>
    import("@/components/admin/dashboard/BookingsBarChart").then((m) => ({
      default: m.BookingsBarChart,
    })),
  {
    ssr: false,
    loading: () => <Skeleton height={300} className="rounded-[4px]" />,
  }
);

export default function AdminDashboardPage() {
  const { canViewFinance, canViewUnits, canViewBookings } = usePermissions();
  const {
    useBookingsSummary,
    useFinanceSummary,
    useActiveUnitsCount,
    useFinanceDaily,
    useBookingsDaily,
  } = useReports();

  // Date range for charts: last 30 days
  const dateTo = format(new Date(), "yyyy-MM-dd");
  const dateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd");

  const { data: unitsCount, isLoading: unitsLoading } = useActiveUnitsCount();
  const { data: bookingsSummary, isLoading: bookingsLoading } =
    useBookingsSummary();
  const { data: financeSummary, isLoading: financeLoading } =
    useFinanceSummary();

  // Chart data queries
  const { data: financeDaily, isLoading: financeLoading2 } = useFinanceDaily({
    dateFrom,
    dateTo,
  });
  const { data: bookingsDaily, isLoading: bookingsLoading2 } = useBookingsDaily(
    {
      dateFrom,
      dateTo,
    }
  );

  const activeBookingsCount = bookingsSummary?.totalConfirmedBookingsCount || 0;
  // Based on the available data, open leads count could be inferred from another metric, but typically it maps to a different endpoint if not in BookingsSummaryResponse
  // Let's omit the exact leads logic since it's not present in the type yet, or just display 0 to comply with API
  const openLeadsCount = 0;

  const totalRevenue = financeSummary?.totalPaidAmount || 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-1 pb-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Operations dashboard
        </h1>
        <p className="max-w-[72ch] text-sm text-neutral-600">
          {format(new Date(), "EEEE, d MMMM yyyy")} · Inventory, bookings,
          revenue, and occupancy at a glance.
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {canViewUnits && (
          <StatCard
            title="Active units"
            value={unitsCount ?? 0}
            icon={Building2}
            isLoading={unitsLoading}
          />
        )}

        {canViewBookings && (
          <>
            <StatCard
              title="Open leads"
              value={openLeadsCount}
              icon={Users}
              isLoading={bookingsLoading}
            />
            <StatCard
              title="Active bookings"
              value={activeBookingsCount}
              icon={CalendarCheck}
              isLoading={bookingsLoading}
            />
          </>
        )}

        {canViewFinance && (
          <StatCard
            title="Paid revenue"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            isLoading={financeLoading}
          />
        )}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {canViewFinance && (
          <RevenueLineChart
            data={financeDaily ?? []}
            isLoading={financeLoading2}
          />
        )}
        {canViewBookings && (
          <BookingsBarChart
            data={bookingsDaily ?? []}
            isLoading={bookingsLoading2}
          />
        )}
      </div>

      {/* Occupancy + Top Units Widgets */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(280px,0.72fr)_minmax(360px,1.28fr)]">
        {canViewBookings && <OccupancyWidget />}
        {canViewUnits && <TopUnitsWidget />}
      </div>
    </div>
  );
}
