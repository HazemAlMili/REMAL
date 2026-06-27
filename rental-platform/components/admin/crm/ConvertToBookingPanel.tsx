"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useConvertToBooking } from "@/lib/hooks/useCrm";
import { useCreateClient } from "@/lib/hooks/useClients";
import { useAvailabilityCheck } from "@/lib/hooks/usePublic";
import { clientsService } from "@/lib/api/services/clients.service";
import { toastSuccess } from "@/lib/utils/toast";
import { usePermissions } from "@/lib/hooks/usePermissions";
import {
  CRM_CLOSED_STATUSES,
  CRM_STATUS_LABELS,
} from "@/lib/constants/booking-statuses";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDateRange, getNights } from "@/lib/utils/format";
import type { CrmLeadDetailsResponse } from "@/lib/types/crm.types";
import type { CreateClientRequest } from "@/lib/types";
import {
  Check,
  CircleAlert,
  Copy,
  Loader2,
  PencilLine,
} from "lucide-react";

const newClientSchema = z.object({
  name: z.string().min(1, "Please enter the client name"),
  phone: z
    .string()
    .min(1, "Please enter the phone number")
    .regex(/^\+?\d{10,15}$/, "Enter 10 to 15 digits, optionally starting with +"),
  email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
});

interface ConvertToBookingPanelProps {
  leadId: string;
  lead: CrmLeadDetailsResponse;
}

export function ConvertToBookingPanel({
  leadId,
  lead,
}: ConvertToBookingPanelProps) {
  const { canManageCRM } = usePermissions();
  const convertMutation = useConvertToBooking(leadId);
  const createClientMutation = useCreateClient();

  // The lead is already linked to a client → the backend forces that client, so the
  // choice is locked. Otherwise the team creates/attaches one during conversion.
  const clientLocked = Boolean(lead.clientId);

  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [clientId, setClientId] = useState<string>(lead.clientId ?? "");
  const [attachedClient, setAttachedClient] = useState<{
    name: string;
    phone: string;
  } | null>(
    // A pre-linked client is shown by the lead's own contact identity — never a raw ID.
    lead.clientId ? { name: lead.contactName, phone: lead.contactPhone } : null
  );

  const [guestCount, setGuestCount] = useState<number>(lead.guestCount ?? 1);
  const [internalNotes, setInternalNotes] = useState("");

  const {
    register: registerClient,
    handleSubmit: handleClientSubmit,
    reset: resetClientForm,
    formState: { errors: clientErrors, isSubmitting: isCreatingClient },
  } = useForm<CreateClientRequest>({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      name: lead.contactName ?? "",
      phone: lead.contactPhone ?? "",
      email: lead.contactEmail ?? "",
    },
  });

  // ── Agreed deal terms (the lead is the source of truth — these are NOT editable here) ──
  const checkIn = lead.desiredCheckInDate;
  const checkOut = lead.desiredCheckOutDate;
  const hasCompleteDeal = Boolean(lead.targetUnitId && checkIn && checkOut);
  const nights = checkIn && checkOut ? getNights(checkIn, checkOut) : 0;

  // Live re-validation: the agreed dates were available when the lead was created, but
  // a block or another booking may have landed since. Re-check now; block convert if so.
  const {
    data: availability,
    isLoading: isCheckingAvailability,
  } = useAvailabilityCheck(lead.targetUnitId ?? "", checkIn, checkOut);
  const hasDateConflict = availability?.isAvailable === false;

  const attachClient = (id: string, name: string, phone: string) => {
    setClientId(id);
    setAttachedClient({ name, phone });
    setShowNewClientForm(false);
  };

  const clearClient = () => {
    setClientId("");
    setAttachedClient(null);
    setTemporaryPassword(null);
    setPasswordCopied(false);
    setShowNewClientForm(true);
    resetClientForm({
      name: lead.contactName ?? "",
      phone: lead.contactPhone ?? "",
      email: lead.contactEmail ?? "",
    });
  };

  // Look up an existing client by phone, then email, via the admin clients search.
  // The backend enforces uniqueness on BOTH, so a match on either means we attach that
  // client instead of failing on a duplicate. Phone identity ignores a leading "+".
  const findExistingClient = async (phone: string, email?: string) => {
    const normalizedPhone = phone.replace(/\+/g, "");
    const byPhone = await clientsService.getAll({
      search: normalizedPhone,
      includeInactive: true,
      pageSize: 20,
    });
    const phoneMatch = byPhone.items.find(
      (c) => c.phone.replace(/\+/g, "") === normalizedPhone
    );
    if (phoneMatch) return { client: phoneMatch, matchedBy: "phone" as const };

    const normalizedEmail = email?.trim().toLowerCase();
    if (normalizedEmail) {
      const byEmail = await clientsService.getAll({
        search: normalizedEmail,
        includeInactive: true,
        pageSize: 20,
      });
      const emailMatch = byEmail.items.find(
        (c) => c.email?.toLowerCase() === normalizedEmail
      );
      if (emailMatch) return { client: emailMatch, matchedBy: "email" as const };
    }

    return null;
  };

  const onCreateClient = async (data: CreateClientRequest) => {
    const phone = data.phone.trim();
    const email = data.email?.trim() || undefined;

    // Attach an existing client on a phone/email match rather than failing with a
    // duplicate error and forcing a manual ID paste.
    try {
      const existing = await findExistingClient(phone, email);
      if (existing) {
        attachClient(existing.client.id, existing.client.name, existing.client.phone);
        setTemporaryPassword(null);
        setPasswordCopied(false);
        toastSuccess(
          `Existing client attached (matched by ${existing.matchedBy}): ${existing.client.name}`
        );
        return;
      }
    } catch {
      // Lookup failed (transient/permission) — fall through to create, which still
      // surfaces a clear error if the client turns out to already exist.
    }

    createClientMutation.mutate(
      { ...data, email },
      {
        onSuccess: (client) => {
          attachClient(client.id, client.name, client.phone);
          setTemporaryPassword(client.temporaryPassword);
          setPasswordCopied(false);
        },
      }
    );
  };

  const handleConvert = () => {
    if (!hasCompleteDeal || !checkIn || !checkOut) return;
    convertMutation.mutate({
      clientId,
      unitId: lead.targetUnitId!,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestCount,
      internalNotes: internalNotes.trim() || undefined,
    });
  };

  // ── Gating ──
  if (CRM_CLOSED_STATUSES.includes(lead.leadStatus)) {
    return null;
  }

  if (lead.leadStatus !== "Booked") {
    return (
      <div className="grid gap-3 rounded-[var(--portal-radius-card,8px)] border border-warning-bg bg-warning-bg p-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
        <h3 className="text-sm font-semibold text-warning">Convert to booking</h3>
        <div className="space-y-1">
          <p className="text-sm text-warning">
            This lead must be moved to <strong>Booked</strong> status before it
            can be converted to a booking.
          </p>
          <p className="text-xs text-warning/80">
            Current status:{" "}
            <strong>
              {CRM_STATUS_LABELS[lead.leadStatus] ?? lead.leadStatus}
            </strong>
          </p>
        </div>
      </div>
    );
  }

  // Conversion materializes the lead's agreed terms verbatim. If the unit or dates are
  // missing, there is nothing validated to convert — direct the team to set them first.
  if (!hasCompleteDeal) {
    const missing = [
      !lead.targetUnitId && "a target unit",
      !(checkIn && checkOut) && "stay dates",
    ].filter(Boolean);
    return (
      <div className="space-y-2 rounded-[var(--portal-radius-card,8px)] border border-warning-bg bg-warning-bg p-4">
        <h3 className="text-sm font-semibold text-warning">Convert to booking</h3>
        <p className="text-sm text-warning">
          Add {missing.join(" and ")} to this lead before converting. The booking
          is created from the lead&apos;s agreed details, so they must be set —
          and availability validated — on the lead first.
        </p>
      </div>
    );
  }

  const availabilityChip = isCheckingAvailability ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
      <Loader2 className="h-3 w-3 animate-spin" /> Checking
    </span>
  ) : hasDateConflict ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-error-bg px-2 py-0.5 text-[11px] font-medium text-error">
      <CircleAlert className="h-3 w-3" /> Unavailable
    </span>
  ) : availability?.isAvailable ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-[11px] font-medium text-success">
      <Check className="h-3 w-3" /> Available
    </span>
  ) : null;

  const canConvert =
    canManageCRM &&
    Boolean(clientId) &&
    !hasDateConflict &&
    !isCheckingAvailability &&
    guestCount >= 1 &&
    !convertMutation.isPending;

  return (
    <section className="space-y-5 rounded-[var(--portal-radius-card,8px)] border border-neutral-200 bg-white p-5">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900">
          Convert to booking
        </h3>
        <p className="mt-0.5 text-xs text-neutral-500">
          Confirm the agreed terms and create the booking. Unit and dates are
          locked to this lead.
        </p>
      </div>

      {/* Agreed deal — read-only. Dates are not editable here by design. */}
      <dl className="divide-y divide-neutral-200/70 overflow-hidden rounded-[var(--portal-radius-control,6px)] bg-neutral-50">
        <div className="flex items-center justify-between gap-4 px-3.5 py-2.5">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
            Unit
          </dt>
          <dd className="text-right text-sm font-medium text-neutral-900">
            {lead.targetUnitName ?? "Linked unit"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-3.5 py-2.5">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
            Stay
          </dt>
          <dd className="flex flex-wrap items-center justify-end gap-2">
            <span className="text-sm font-medium tabular-nums text-neutral-900">
              {formatDateRange(checkIn!, checkOut!)}
            </span>
            <span className="text-xs tabular-nums text-neutral-500">
              {nights} {nights === 1 ? "night" : "nights"}
            </span>
            {availabilityChip}
          </dd>
        </div>
      </dl>

      {hasDateConflict && (
        <div className="flex items-start gap-2.5 rounded-[var(--portal-radius-control,6px)] border border-error-bg bg-error-bg p-3 text-sm text-error">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">These dates are no longer available.</p>
            <p className="mt-0.5 text-error/90">
              They were blocked or booked after this lead was created. Update the
              stay dates on the lead — which re-checks availability — then convert.
              {availability?.blockedDates?.length
                ? ` Conflicting: ${availability.blockedDates.join(", ")}.`
                : ""}
            </p>
          </div>
        </div>
      )}

      {/* Client */}
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
          Client
        </p>

        {attachedClient ? (
          <div className="flex items-center justify-between gap-3 rounded-[var(--portal-radius-control,6px)] border border-success-bg bg-success-bg px-3.5 py-2.5">
            <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-success">
              <Check className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {attachedClient.name}
                <span className="text-success/70"> · {attachedClient.phone}</span>
              </span>
            </span>
            {!clientLocked && (
              <button
                type="button"
                onClick={clearClient}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-800"
              >
                <PencilLine className="h-3.5 w-3.5" /> Change
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 rounded-[var(--portal-radius-control,6px)] border border-neutral-200 bg-neutral-50 p-3.5">
            <p className="text-xs text-neutral-600">
              This lead isn&apos;t a client yet. Create one from the contact
              details below — if the phone or email already exists, we&apos;ll
              attach that client instead.
            </p>
            <Input
              label="Full name"
              {...registerClient("name")}
              error={clientErrors.name?.message}
              required
              disabled={createClientMutation.isPending}
            />
            <Input
              label="Phone number"
              {...registerClient("phone")}
              error={clientErrors.phone?.message}
              required
              disabled={createClientMutation.isPending}
            />
            <Input
              label="Email (optional)"
              type="email"
              {...registerClient("email")}
              error={clientErrors.email?.message}
              disabled={createClientMutation.isPending}
            />
            {showNewClientForm && (
              <button
                type="button"
                onClick={() => setShowNewClientForm(false)}
                className="text-xs font-medium text-neutral-400 hover:text-neutral-600"
              >
                Cancel
              </button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isCreatingClient || createClientMutation.isPending}
              disabled={isCreatingClient || createClientMutation.isPending}
              onClick={handleClientSubmit(onCreateClient)}
              className="w-full"
            >
              Create or attach client
            </Button>
          </div>
        )}

        {temporaryPassword && (
          <div className="rounded-[var(--portal-radius-control,6px)] border border-warning-bg bg-warning-bg p-3">
            <p className="text-xs font-medium text-warning">Temporary password</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 break-all font-mono text-sm text-neutral-900">
                {temporaryPassword}
              </code>
              <button
                type="button"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--portal-radius-control,6px)] border border-warning bg-white text-warning hover:bg-warning-bg"
                aria-label="Copy temporary password"
                title="Copy temporary password"
                onClick={async () => {
                  await navigator.clipboard.writeText(temporaryPassword);
                  setPasswordCopied(true);
                }}
              >
                {passwordCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-warning/80">
              This password is returned once. Give it to the client securely.
            </p>
          </div>
        )}
      </div>

      {/* Guests + notes */}
      <div className="space-y-3">
        <Input
          label="Guests"
          type="number"
          min={1}
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
          disabled={convertMutation.isPending}
          required
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Internal notes{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Add booking context for operations or finance"
            className="h-20 w-full resize-none rounded-[var(--portal-radius-control,6px)] border border-neutral-300 p-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400"
            disabled={convertMutation.isPending}
          />
        </div>
      </div>

      {canManageCRM && (
        <Button
          type="button"
          onClick={handleConvert}
          isLoading={convertMutation.isPending}
          disabled={!canConvert}
          className="w-full"
        >
          {hasDateConflict
            ? "Dates unavailable"
            : !clientId
              ? "Attach a client to continue"
              : "Convert lead to booking"}
        </Button>
      )}
    </section>
  );
}
