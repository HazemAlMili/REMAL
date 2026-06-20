"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Combobox } from "@/components/ui/Combobox";
import { useClients } from "@/lib/hooks/useClients";
import { useInternalUnitsList } from "@/lib/hooks/useUnits";
import { useCreateQuickBooking } from "@/lib/hooks/useBookings";
import type { CreateBookingRequest } from "@/lib/types/booking.types";

interface QuickBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOURCE_OPTIONS: Array<{ value: CreateBookingRequest["source"]; label: string }> = [
  { value: "admin", label: "Admin" },
  { value: "direct", label: "Direct" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "website", label: "Website" },
];

export function QuickBookingModal({ isOpen, onClose }: QuickBookingModalProps) {
  const createMutation = useCreateQuickBooking();
  const { data: clientsData, isLoading: clientsLoading } = useClients({
    includeInactive: false,
    pageSize: 500,
  });
  const { data: unitsData, isLoading: unitsLoading } = useInternalUnitsList({
    pageSize: 500,
    isActive: true,
  });

  const [form, setForm] = React.useState<CreateBookingRequest>({
    clientId: "",
    unitId: "",
    checkInDate: "",
    checkOutDate: "",
    guestCount: 1,
    source: "admin",
    internalNotes: "",
  });

  React.useEffect(() => {
    if (!isOpen) {
      setForm({
        clientId: "",
        unitId: "",
        checkInDate: "",
        checkOutDate: "",
        guestCount: 1,
        source: "admin",
        internalNotes: "",
      });
    }
  }, [isOpen]);

  const clientOptions = React.useMemo(
    () =>
      (clientsData?.items ?? []).map((client) => ({
        value: client.id,
        label: `${client.name} - ${client.phone}`,
      })),
    [clientsData?.items]
  );

  const unitOptions = React.useMemo(
    () =>
      (unitsData?.items ?? []).map((unit) => ({
        value: unit.id,
        label: `${unit.name} - ${unit.areaName ?? "Unassigned area"}`,
      })),
    [unitsData?.items]
  );

  const canSubmit =
    form.clientId &&
    form.unitId &&
    form.checkInDate &&
    form.checkOutDate &&
    form.guestCount > 0 &&
    !createMutation.isPending;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    createMutation.mutate(
      {
        ...form,
        internalNotes: form.internalNotes?.trim() || undefined,
      },
      {
        onSuccess: onClose,
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Booking" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Client
            </label>
            <Combobox
              options={clientOptions}
              value={form.clientId || null}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  clientId: value ? String(value) : "",
                }))
              }
              placeholder={clientsLoading ? "Loading clients..." : "Select client"}
              disabled={clientsLoading || createMutation.isPending}
              searchable
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Unit
            </label>
            <Combobox
              options={unitOptions}
              value={form.unitId || null}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  unitId: value ? String(value) : "",
                }))
              }
              placeholder={unitsLoading ? "Loading units..." : "Select unit"}
              disabled={unitsLoading || createMutation.isPending}
              searchable
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Check-in"
            type="date"
            value={form.checkInDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                checkInDate: event.target.value,
              }))
            }
            disabled={createMutation.isPending}
            required
          />
          <Input
            label="Check-out"
            type="date"
            value={form.checkOutDate}
            min={form.checkInDate || undefined}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                checkOutDate: event.target.value,
              }))
            }
            disabled={createMutation.isPending}
            required
          />
          <Input
            label="Guests"
            type="number"
            min={1}
            value={form.guestCount}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                guestCount: Number(event.target.value),
              }))
            }
            disabled={createMutation.isPending}
            required
          />
        </div>

        <Select
          label="Source"
          value={form.source}
          options={SOURCE_OPTIONS}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              source: String(value) as CreateBookingRequest["source"],
            }))
          }
          disabled={createMutation.isPending}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Internal notes
          </label>
          <textarea
            value={form.internalNotes}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                internalNotes: event.target.value,
              }))
            }
            className="h-24 w-full resize-none rounded-[var(--portal-radius-control)] border border-neutral-300 p-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={createMutation.isPending}
          />
        </div>

        <Modal.Footer>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createMutation.isPending}
            disabled={!canSubmit}
          >
            Create booking
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
