"use client";

import { usePermissions } from "@/lib/hooks/usePermissions";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { useReports } from "@/lib/hooks/useReports";
import { Building2, Users, CalendarCheck, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

export default function AdminDashboardPage() {
  const { canViewFinance, canViewUnits, canViewBookings } = usePermissions();
  const { useBookingsSummary, useFinanceSummary, useActiveUnitsCount } =
    useReports();

  const { data: unitsCount, isLoading: unitsLoading } = useActiveUnitsCount();
  const { data: bookingsSummary, isLoading: bookingsLoading } =
    useBookingsSummary();
  const { data: financeSummary, isLoading: financeLoading } =
    useFinanceSummary();

  const activeBookingsCount = bookingsSummary?.totalConfirmedBookingsCount || 0;
  // Based on the available data, open leads count could be inferred from another metric, but typically it maps to a different endpoint if not in BookingsSummaryResponse
  // Let's omit the exact leads logic since it's not present in the type yet, or just display 0 to comply with API
  const openLeadsCount = 0;

  const totalRevenue = financeSummary?.totalPaidAmount || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome to the Remal Rental Platform admin portal.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {canViewUnits && (
          <StatCard
            title="Total Active Units"
            value={unitsCount ?? 0}
            icon={Building2}
            isLoading={unitsLoading}
          />
        )}

        {canViewBookings && (
          <>
            <StatCard
              title="Open Leads"
              value={openLeadsCount}
              icon={Users}
              isLoading={bookingsLoading}
            />
            <StatCard
              title="Active Bookings"
              value={activeBookingsCount}
              icon={CalendarCheck}
              isLoading={bookingsLoading}
            />
          </>
        )}

        {canViewFinance && (
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            isLoading={financeLoading}
          />
        )}
      </div>
    </div>
  );
}
