"use client";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useOwnerProfile } from "@/lib/hooks/useOwnerPortal";
import { OwnerProfileCard } from "@/components/owner/profile/OwnerProfileCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Info } from "lucide-react";

export default function OwnerProfilePage() {
  const { user } = useAuthStore();
  const { data: profile, isLoading, isError } = useOwnerProfile();

  // Fallback to auth store identifier if profile endpoint is unavailable
  const displayName = profile?.name ?? "—";
  const displayPhone = profile?.phone ?? user?.identifier ?? "—";
  const displayEmail = profile?.email ?? null;
  const displayCommission = profile?.commissionRate;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>

      {isLoading ? (
        <Skeleton className="h-64 w-full max-w-2xl" />
      ) : (
        <>
          <OwnerProfileCard
            name={displayName}
            phone={displayPhone}
            email={displayEmail}
            commissionRate={displayCommission}
          />

          {/* Contact Admin Notice */}
          <div className="flex max-w-2xl items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Need to update your info?
              </p>
              <p className="mt-1 text-sm text-blue-700">
                To update your information, contact the platform administrator.
                Owners cannot edit their own profile details.
              </p>
            </div>
          </div>

          {/* Backend Gap Warning (Rendered as subtle dev note if endpoint fails) */}
          {isError && (
            <div className="max-w-2xl rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-800">
                ⚠️ Profile details unavailable — backend profile endpoint not
                connected. Showing phone from login data.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
