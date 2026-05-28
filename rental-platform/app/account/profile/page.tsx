"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useClientProfile, useUpdateClientProfile } from "@/lib/hooks/useClient";
import { ApiError } from "@/lib/api/api-error";
import { Mail, Phone, User } from "lucide-react";

export default function ClientProfilePage() {
  const { data: profile, isLoading, isError } = useClientProfile();
  const updateProfileMutation = useUpdateClientProfile();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;

    setName(profile.name);
    setPhone(profile.phone);
    setEmail(profile.email ?? "");
  }, [profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!name.trim() || !phone.trim()) {
      setFormError("Name and phone are required.");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        email: profile?.email ?? null,
      });
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "Profile could not be updated."
      );
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-100" />
        <div className="h-80 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <EmptyState
        title="Profile could not load"
        description="Refresh the page or try again after a moment."
        icon={<User className="h-12 w-12" />}
      />
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900">
          Profile
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Keep your booking contact details current.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-neutral-100 bg-white p-6 shadow-card"
      >
        <Input
          label="Full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          leftAddon={<User className="h-4 w-4" />}
        />

        <Input
          label="Phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
          leftAddon={<Phone className="h-4 w-4" />}
        />

        <Input
          label="Email"
          value={email}
          readOnly
          disabled
          helperText="Read-only"
          leftAddon={<Mail className="h-4 w-4" />}
        />

        {!profile.isActive && (
          <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
            This profile is inactive. Contact support before making new bookings.
          </p>
        )}

        {formError && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-error">
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setName(profile.name);
              setPhone(profile.phone);
              setFormError(null);
            }}
          >
            Reset
          </Button>
          <Button type="submit" isLoading={updateProfileMutation.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}