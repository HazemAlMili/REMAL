import Link from "next/link";
import type { OwnerPortalFinanceRowResponse } from "@/lib/types/owner-portal.types";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ROUTES } from "@/lib/constants/routes";
import { PAYOUT_STATUS_COLORS } from "@/lib/constants/payout-statuses";

interface OwnerFinanceTableProps {
  rows: OwnerPortalFinanceRowResponse[];
}

export function OwnerFinanceTable({ rows }: OwnerFinanceTableProps) {
  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-neutral-100 text-neutral-700";
      case "Issued":
        return "bg-blue-100 text-blue-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  const getPayoutStatusColor = (status: string | null) => {
    if (!status) return "bg-neutral-100 text-neutral-500";

    const colorMap = {
      warning: "bg-yellow-100 text-yellow-700",
      info: "bg-blue-100 text-blue-700",
      success: "bg-green-100 text-green-700",
      danger: "bg-red-100 text-red-700",
    };

    const color = PAYOUT_STATUS_COLORS[status] || "warning";
    return colorMap[color];
  };

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Booking ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Unit ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Invoice Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Invoiced Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Paid Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Remaining Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Payout Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Payout Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Payout Paid At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {rows.map((row) => (
              <tr
                key={row.bookingId}
                className="border-b border-neutral-200 transition-colors hover:bg-neutral-50"
              >
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={ROUTES.owner.bookingDetail(row.bookingId)}
                    className="font-mono text-xs text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    {row.bookingId.slice(0, 8)}...
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={ROUTES.owner.unitDetail(row.unitId)}
                    className="font-mono text-xs text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    {row.unitId.slice(0, 8)}...
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                      getInvoiceStatusColor(row.invoiceStatus),
                    ].join(" ")}
                  >
                    {row.invoiceStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                  {formatCurrency(row.invoicedAmount)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">
                  {formatCurrency(row.paidAmount)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-orange-600">
                  {formatCurrency(row.remainingAmount)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                  {row.payoutAmount !== null
                    ? formatCurrency(row.payoutAmount)
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {row.payoutStatus ? (
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                        getPayoutStatusColor(row.payoutStatus),
                      ].join(" ")}
                    >
                      {row.payoutStatus}
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {formatDate(row.payoutPaidAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
