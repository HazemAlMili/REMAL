"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useConvertToBooking } from "@/lib/hooks/useCrm";
import { useCreateClient } from "@/lib/hooks/useClients";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDateRange, getNights } from "@/lib/utils/format";
import type {
  CrmLeadDetailsResponse,
  ConvertLeadToBookingRequest,
} from "@/lib/types/crm.types";
import type { CreateClientRequest } from "@/lib/types";

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
  phone: z.string().min(1, "Please enter the phone number"),
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ConvertLeadToBookingRequest>({
    resolver: zodResolver(convertSchema),
    defaultValues: {
      clientId: lead.clientId ?? "",
      unitId: lead.targetUnitId ?? "",
      checkInDate: lead.desiredCheckInDate ?? "",
      checkOutDate: lead.desiredCheckOutDate ?? "",
      guestCount: lead.guestCount ?? 1,
      internalNotes: "",
    },
  });

  const {
    register: registerClient,
    handleSubmit: handleClientSubmit,
    reset: resetClientForm,
    formState: { errors: clientErrors },
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

  const onCreateClient = (data: CreateClientRequest) => {
    createClientMutation.mutate(
      { ...data, email: data.email || undefined },
      {
        onSuccess: (client) => {
          setValue("clientId", client.id, { shouldValidate: true });
          setShowNewClientForm(false);
          resetClientForm();
        },
      }
    );
  };

  const nights =
    lead.desiredCheckInDate && lead.desiredCheckOutDate
      ? getNights(lead.desiredCheckInDate, lead.desiredCheckOutDate)
      : 0;

  if (lead.leadStatus === "Converted" || lead.leadStatus === "Lost") {
    return null;
  }

  // Only show convert panel if lead is Qualified
  if (lead.leadStatus !== "Qualified") {
    return (
      <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-800">
          Convert to booking
        </h3>
        <p className="text-sm text-amber-700">
          This lead must be moved to <strong>Qualified</strong> status before it
          can be converted to a booking.
        </p>
        <p className="text-xs text-amber-600">
          Sales funnel: <strong>New</strong> to <strong>Contacted</strong> to{" "}
          <strong>Qualified</strong> to <strong>Convert to booking</strong>
        </p>
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
        </div>

        {/* Inline new client form */}
        {showNewClientForm && (
          <div className="space-y-3 rounded-md border border-neutral-200 bg-white p-3">
            <p className="text-xs font-medium text-neutral-600">
              Create a client and fill the client ID automatically.
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
              isLoading={createClientMutation.isPending}
              disabled={createClientMutation.isPending}
              onClick={handleClientSubmit(onCreateClient)}
            >
              Create client
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
