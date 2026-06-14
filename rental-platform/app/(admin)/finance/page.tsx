"use client";

import { useState } from "react";
import { format } from "date-fns";
import { FinanceSummaryCards } from "@/components/admin/finance/FinanceSummaryCards";
import {
  ReportRangeFilter,
  type ReportRangeValue,
} from "@/components/admin/analytics/ReportRangeFilter";
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

  // Overview defaults to all-time totals; the filter can narrow to any period.
  const [range, setRange] = useState<ReportRangeValue>({
    preset: "all",
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
    dateFrom: range.from ? format(range.from, "yyyy-MM-dd") : undefined,
    dateTo: range.to ? format(range.to, "yyyy-MM-dd") : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Finance hub
          </h1>
          <p className="text-sm text-neutral-500">
            Review paid amounts, open balances, invoices, and owner payout
            activity.
          </p>
        </div>
        <ReportRangeFilter value={range} onChange={setRange} />
      </div>

      {isError && (
        <div className="bg-destructive/10 text-destructive flex items-center justify-between rounded-md p-4">
          <p>We could not load the finance summary. Retry to refresh the numbers.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      <FinanceSummaryCards data={summary} isLoading={isLoading} />

      <div className="mt-4 flex flex-wrap gap-4">
        <Link href={ROUTES.admin.financePayments}>
          <Button variant="secondary">Open payments ledger</Button>
        </Link>
        <Link href={ROUTES.admin.financePayouts}>
          <Button variant="secondary">Manage owner payouts</Button>
        </Link>
      </div>
    </div>
  );
}
