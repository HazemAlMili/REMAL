"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useConvertToBooking } from "@/lib/hooks/useCrm";
import { useCreateClient } from "@/lib/hooks/useClients";
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
import type {
  CrmLeadDetailsResponse,
  ConvertLeadToBookingRequest,
} from "@/lib/types/crm.types";
import type { CreateClientRequest } from "@/lib/types";
import { Check, Copy } from "lucide-react";

const convertSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  unitId: z.string().min(1, "Please select a unit"),
  checkInDate: z.string().min(1, "Please enter the check-in date"),
  checkOutDate: z.string().min(1, "Please enter the check-out date"),
  guestCount: z
    .number({ invalid_type_error: "Please enter the guest count" })
    .min(1, "Guest count must be at least 1"),
  internalNotes: z.string().optional(),
});

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
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [attachedClient, setAttachedClient] = useState<{
    name: string;
    phone: string;
  } | null>(null);

  const leadBookingDefaults = {
    clientId: lead.clientId ?? "",
    unitId: lead.targetUnitId ?? "",
    checkInDate: lead.desiredCheckInDate ?? "",
    checkOutDate: lead.desiredCheckOutDate ?? "",
    guestCount: lead.guestCount ?? 1,
  };

  const {
    register,
    handleSubmit,
    reset: resetConvertForm,
    getValues,
    formState: { errors },
  } = useForm<ConvertLeadToBookingRequest>({
    resolver: zodResolver(convertSchema),
    defaultValues: { ...leadBookingDefaults, internalNotes: "" },
  });

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

  const onSubmit = (data: ConvertLeadToBookingRequest) => {
    convertMutation.mutate(data);
  };

  // Populate the whole convert form in one shot — the new/existing client's ID plus
  // the unit, dates, and guests carried over from the lead — and collapse the create
  // form, so converting is ready without any manual entry. Using reset() (not setValue)
  // reliably re-syncs the uncontrolled inputs. Any notes already typed are preserved.
  const attachClient = (id: string, name: string, phone: string) => {
    resetConvertForm({
      ...leadBookingDefaults,
      clientId: id,
      internalNotes: getValues("internalNotes") ?? "",
    });
    setAttachedClient({ name, phone });
    setShowNewClientForm(false);
    resetClientForm();
  };

  // Look up an existing client by phone, then by email, via the admin clients search.
  // The backend enforces uniqueness on BOTH phone and email, so a match on either means
  // a new client can't be created — we attach that client instead. Phone identity
  // ignores a leading "+", matching how the backend dedupes.
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

    // If this phone OR email already belongs to a client, attach them directly instead
    // of failing with a duplicate error and forcing a manual ID paste.
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

  const nights =
    lead.desiredCheckInDate && lead.desiredCheckOutDate
      ? getNights(lead.desiredCheckInDate, lead.desiredCheckOutDate)
      : 0;

  if (CRM_CLOSED_STATUSES.includes(lead.leadStatus)) {
    return null;
  }

  if (lead.leadStatus !== "Booked") {
    return (
      <div className="grid gap-3 rounded-[var(--portal-radius-card)] border border-warning-bg bg-warning-bg p-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
        <h3 className="text-sm font-semibold text-amber-800">
          Convert to booking
        </h3>
        <div className="space-y-1">
          <p className="text-sm text-amber-700">
            This lead must be moved to <strong>Booked</strong> status before
            it can be converted to a booking.
          </p>
          <p className="text-xs text-amber-600">
            Current status:{" "}
            <strong>{CRM_STATUS_LABELS[lead.leadStatus] ?? lead.leadStatus}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary-50/30 space-y-4 rounded-lg border border-primary-200 p-4">
      <h3 className="text-sm font-semibold text-primary-800">
        Convert to booking
      </h3>

      {/* Summary */}
      {lead.targetUnitId && (
        <div className="text-sm text-neutral-600">
          <p>Unit: {lead.targetUnitName || lead.targetUnitId}</p>
          {lead.desiredCheckInDate && lead.desiredCheckOutDate && (
            <p>
              Dates:{" "}
              {formatDateRange(
                lead.desiredCheckInDate,
                lead.desiredCheckOutDate
              )}{" "}
              ({nights} nights)
            </p>
          )}
          {lead.guestCount && <p>Guests: {lead.guestCount}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {temporaryPassword && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-800">
              Temporary password
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 break-all font-mono text-sm text-neutral-900">
                {temporaryPassword}
              </code>
              <button
                type="button"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-amber-300 bg-white text-amber-800 hover:bg-amber-100"
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
            <p className="mt-2 text-xs text-amber-700">
              This password is returned once. Give it to the client securely.
            </p>
          </div>
        )}

        {/* Client ID field + create toggle */}
        <div className="space-y-1">
          <Input
            label="Client ID"
            {...register("clientId")}
            error={errors.clientId?.message}
            required
            disabled={convertMutation.isPending}
            placeholder="Paste client ID or create one below"
          />
          <button
            type="button"
            className="text-xs text-primary-600 hover:underline"
            onClick={() => setShowNewClientForm((v) => !v)}
          >
            {showNewClientForm
              ? "Hide new client form"
              : "Lead is not a client yet? Create one"}
          </button>
          {attachedClient && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <Check className="h-3.5 w-3.5 shrink-0" />
              Client attached: {attachedClient.name} ({attachedClient.phone})
            </p>
          )}
        </div>

        {/* Inline new client form */}
        {showNewClientForm && (
          <div className="space-y-3 rounded-md border border-neutral-200 bg-white p-3">
            <p className="text-xs font-medium text-neutral-600">
              Create a client — or, if this phone already exists, attach that
              client — and fill the client ID automatically.
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isCreatingClient || createClientMutation.isPending}
              disabled={isCreatingClient || createClientMutation.isPending}
              onClick={handleClientSubmit(onCreateClient)}
            >
              Create or attach client
            </Button>
          </div>
        )}

        <Input
          label="Unit ID"
          {...register("unitId")}
          error={errors.unitId?.message}
          required
          disabled={convertMutation.isPending}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Check-in date"
            type="date"
            {...register("checkInDate")}
            error={errors.checkInDate?.message}
            required
            disabled={convertMutation.isPending}
          />
          <Input
            label="Check-out date"
            type="date"
            {...register("checkOutDate")}
            error={errors.checkOutDate?.message}
            required
            disabled={convertMutation.isPending}
          />
        </div>
        <Input
          label="Guest count"
          type="number"
          {...register("guestCount", { valueAsNumber: true })}
          error={errors.guestCount?.message}
          required
          disabled={convertMutation.isPending}
        />
        <div className="w-full">
          <textarea
            {...register("internalNotes")}
            placeholder="Add booking context for operations or finance"
            className="h-20 w-full resize-none rounded-md border border-neutral-200 p-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400"
            disabled={convertMutation.isPending}
          />
        </div>

        {canManageCRM && (
          <Button
            type="submit"
            isLoading={convertMutation.isPending}
            disabled={convertMutation.isPending}
            className="w-full"
          >
            Convert lead to booking
          </Button>
        )}
      </form>
    </div>
  );
}
