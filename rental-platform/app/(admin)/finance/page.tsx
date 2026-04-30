"use client";

import { useState } from "react";
import { FinanceSummaryCards } from "@/components/admin/finance/FinanceSummaryCards";
import {
  DateRangePicker,
  type DateRange,
} from "@/components/ui/DateRangePicker";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants/routes";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useReports } from "@/lib/hooks/useReports";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function FinanceOverviewPage() {
  const { canViewFinance } = usePermissions();

  if (canViewFinance === false) {
    redirect(ROUTES.admin.dashboard);
  }

  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });

  const { useFinanceSummary } = useReports();
  const {
    data: summary,
    isLoading,
    isError,
    refetch,
  } = useFinanceSummary({
    dateFrom: dateRange?.from
      ? dateRange.from.toISOString().split("T")[0]
      : undefined,
    dateTo: dateRange?.to
      ? dateRange.to.toISOString().split("T")[0]
      : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Finance Overview
          </h1>
          <p className="text-muted-foreground">
            Financial summary and quick access to payments and owner payouts.
          </p>
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          placeholder="Filter by date range"
        />
      </div>

      {isError && (
        <div className="bg-destructive/10 text-destructive flex items-center justify-between rounded-md p-4">
          <p>Failed to load finance summary.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      <FinanceSummaryCards data={summary} isLoading={isLoading} />

      <div className="mt-4 flex flex-wrap gap-4">
        <Link href={ROUTES.admin.financePayments}>
          <Button variant="secondary">View All Payments</Button>
        </Link>
        <Link href={ROUTES.admin.financePayouts}>
          <Button variant="secondary">Manage Owner Payouts</Button>
        </Link>
      </div>
    </div>
  );
}
