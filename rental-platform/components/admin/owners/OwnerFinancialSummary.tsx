"use client";

import { DollarSign, Clock, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import type { OwnerPayoutSummaryResponse } from "@/lib/types/finance.types";

export interface OwnerFinancialSummaryProps {
  summary: OwnerPayoutSummaryResponse;
  isLoading?: boolean;
}

export function OwnerFinancialSummary({
  summary,
  isLoading = false,
}: OwnerFinancialSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={Clock}
        title="Pending Payouts"
        value={formatCurrency(summary.totalPending)}
        isLoading={isLoading}
      />
      <StatCard
        icon={DollarSign}
        title="Scheduled Payouts"
        value={formatCurrency(summary.totalScheduled)}
        isLoading={isLoading}
      />
      <StatCard
        icon={CheckCircle}
        title="Total Paid"
        value={formatCurrency(summary.totalPaid)}
        isLoading={isLoading}
      />
    </div>
  );
}
