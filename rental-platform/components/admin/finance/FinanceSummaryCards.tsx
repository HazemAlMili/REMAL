"use client";

import { StatCard } from "@/components/admin/dashboard/StatCard";
import { formatCurrency } from "@/lib/utils/format";
import type { FinanceAnalyticsSummaryResponse } from "@/lib/types/finance.types";
import {
  FileText,
  DollarSign,
  CreditCard,
  Hourglass,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";

interface FinanceSummaryCardsProps {
  data?: FinanceAnalyticsSummaryResponse;
  isLoading: boolean;
}

export function FinanceSummaryCards({
  data,
  isLoading,
}: FinanceSummaryCardsProps) {
  const cards = [
    {
      title: "Total Invoiced Amount",
      value: data ? formatCurrency(data.totalInvoicedAmount) : "—",
      icon: FileText,
    },
    {
      title: "Total Paid Amount",
      value: data ? formatCurrency(data.totalPaidAmount) : "—",
      icon: DollarSign,
    },
    {
      title: "Total Remaining Amount",
      value: data ? formatCurrency(data.totalRemainingAmount) : "—",
      icon: CreditCard,
    },
    {
      title: "Total Pending Payout Amount",
      value: data ? formatCurrency(data.totalPendingPayoutAmount) : "—",
      icon: Hourglass,
    },
    {
      title: "Total Scheduled Payout Amount",
      value: data ? formatCurrency(data.totalScheduledPayoutAmount) : "—",
      icon: Calendar,
    },
    {
      title: "Total Paid Payout Amount",
      value: data ? formatCurrency(data.totalPaidPayoutAmount) : "—",
      icon: CheckCircle,
    },
    {
      title: "Bookings With Invoice",
      value: data ? data.totalBookingsWithInvoiceCount.toString() : "—",
      icon: FileSpreadsheet,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
