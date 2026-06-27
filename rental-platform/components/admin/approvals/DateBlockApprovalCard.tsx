"use client";

import { format } from "date-fns";
import { AlertTriangle, CalendarDays, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DATE_BLOCK_REASON_LABELS } from "@/lib/constants/date-block-reasons";
import { parseDateOnly, referenceCode } from "@/lib/utils/format";
import type { DateBlockApprovalItem } from "@/lib/types/unit.types";

interface DateBlockApprovalCardProps {
  item: DateBlockApprovalItem;
  isResolving: boolean;
  onApprove: (item: DateBlockApprovalItem) => void;
  onReject: (item: DateBlockApprovalItem) => void;
}

function fmtDate(value: string | null) {
  if (!value) return null;
  try {
    return format(parseDateOnly(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

function formatRange(startDate: string | null, endDate: string | null) {
  const start = fmtDate(startDate);
  const end = fmtDate(endDate);
  if (!start || !end) return "Dates not captured";
  return `${start} – ${end}`;
}

function formatReason(item: DateBlockApprovalItem) {
  if (!item.reason) return "Owner request";
  return DATE_BLOCK_REASON_LABELS[item.reason] ?? item.reason;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <div className="mt-0.5 truncate text-sm text-neutral-800">{children}</div>
    </div>
  );
}

function ConflictRow({
  label,
  reference,
  range,
}: {
  label: string;
  reference: string | null;
  range: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="w-16 shrink-0 text-xs font-medium text-neutral-500">
        {label}
      </span>
      {reference ? (
        <>
          <span className="font-mono text-xs tabular-nums text-neutral-700">
            {reference}
          </span>
          <span className="text-xs tabular-nums text-neutral-500">{range}</span>
        </>
      ) : (
        <span className="text-xs text-neutral-400">None recorded</span>
      )}
    </div>
  );
}

export function DateBlockApprovalCard({
  item,
  isResolving,
  onApprove,
  onReject,
}: DateBlockApprovalCardProps) {
  const leadRef = item.conflictingLeadId
    ? referenceCode("LEAD", item.conflictingLeadId)
    : null;
  const bookingRef = item.conflictingBookingId
    ? referenceCode("BKG", item.conflictingBookingId)
    : null;

  return (
    <article className="rounded-[var(--portal-radius-card)] border border-neutral-200 bg-white">
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          {/* Header: unit + status */}
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-neutral-900">
              {item.unitName}
            </h2>
            <Badge variant="warning" size="sm">
              Pending approval
            </Badge>
          </div>

          {/* Key facts */}
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
            <Field label="Requested dates">
              <span className="tabular-nums">
                {formatRange(item.startDate, item.endDate)}
              </span>
            </Field>
            <Field label="Owner">{item.ownerName}</Field>
            <Field label="Reason">{formatReason(item)}</Field>
            <Field label="Conflicts">
              <span className="inline-flex items-center gap-1.5 text-warning">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="tabular-nums text-neutral-800">
                  {item.conflictCount} active record
                  {item.conflictCount === 1 ? "" : "s"}
                </span>
              </span>
            </Field>
          </div>

          {/* Conflicting records */}
          <div className="rounded-[var(--portal-radius-control)] border border-neutral-200 bg-neutral-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-neutral-700">
              <CalendarDays className="h-3.5 w-3.5" />
              Conflicting pipeline records
            </div>
            <div className="space-y-1.5">
              <ConflictRow
                label="Lead"
                reference={leadRef}
                range={formatRange(
                  item.conflictingLeadStartDate,
                  item.conflictingLeadEndDate
                )}
              />
              <ConflictRow
                label="Booking"
                reference={bookingRef}
                range={formatRange(
                  item.conflictingBookingCheckInDate,
                  item.conflictingBookingCheckOutDate
                )}
              />
            </div>
          </div>

          {item.notes && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Owner note
              </p>
              <p
                dir="auto"
                className="mt-0.5 max-w-[80ch] text-sm text-neutral-600"
              >
                {item.notes}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2 md:w-32 md:flex-col">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onApprove(item)}
            isLoading={isResolving}
            leftIcon={<Check className="h-4 w-4" />}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onReject(item)}
            disabled={isResolving}
            leftIcon={<X className="h-4 w-4" />}
          >
            Reject
          </Button>
        </div>
      </div>
    </article>
  );
}
