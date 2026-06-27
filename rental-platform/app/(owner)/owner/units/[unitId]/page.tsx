"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOwnerUnit } from "@/lib/hooks/useOwnerPortal";
import { Button } from "@/components/ui/Button";
import { formatCurrency, referenceCode } from "@/lib/utils/format";
import { ROUTES } from "@/lib/constants/routes";
import { Check, Copy } from "lucide-react";

function formatDay(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function OwnerUnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = params.unitId as string;

  const { data: unit, isLoading, error, refetch } = useOwnerUnit(unitId);
  const [copied, setCopied] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton header */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-neutral-200" />
          <div className="flex-1 space-y-2">
            <div className="h-8 w-64 animate-pulse rounded bg-neutral-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
          </div>
        </div>

        {/* Skeleton image */}
        <div className="h-96 animate-pulse rounded-lg bg-neutral-200" />

        {/* Skeleton details */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-lg bg-neutral-200"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !unit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.owner.units)}
          >
            ← Back to Units
          </Button>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-700">
            Failed to load unit
          </h2>
          <p className="mt-1 text-sm text-red-600">
            We could not load the unit details.
          </p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.owner.units)}
          >
            ← Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-800">
                {unit.unitName}
              </h1>
              <span
                className={[
                  "rounded-full px-3 py-1 text-sm font-medium",
                  unit.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-neutral-100 text-neutral-600",
                ].join(" ")}
              >
                {unit.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">{unit.unitType}</p>
          </div>
        </div>
      </div>

      {/* Image placeholder - backend gap */}
      <div className="relative h-96 overflow-hidden rounded-lg bg-neutral-100">
        <div className="flex h-full items-center justify-center text-neutral-400">
          <div className="text-center">
            <svg
              className="mx-auto h-24 w-24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <p className="mt-2 text-sm text-neutral-500">No image available</p>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Property details */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Property Details
          </h2>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-neutral-500">Bedrooms</dt>
              <dd className="font-medium text-neutral-900">{unit.bedrooms}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-neutral-500">Bathrooms</dt>
              <dd className="font-medium text-neutral-900">{unit.bathrooms}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-neutral-500">Max Guests</dt>
              <dd className="font-medium text-neutral-900">{unit.maxGuests}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-neutral-500">Unit Type</dt>
              <dd className="font-medium text-neutral-900">{unit.unitType}</dd>
            </div>
          </dl>
        </div>

        {/* Pricing */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-neutral-900">Pricing</h2>
          <div className="mt-4">
            <p className="text-sm text-neutral-500">Base Price</p>
            <p className="mt-1 text-3xl font-bold text-neutral-900">
              {formatCurrency(unit.basePricePerNight)}
            </p>
            <p className="mt-1 text-sm text-neutral-500">per night</p>
          </div>
        </div>

        {/* Status & Info */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Status & Info
          </h2>
          <dl className="mt-4 space-y-4">
            {/* Listing state — plain language, not a raw flag */}
            <div className="flex items-start justify-between gap-3 text-sm">
              <dt className="text-neutral-500">Listing</dt>
              <dd className="text-right">
                <span
                  className={[
                    "inline-flex items-center gap-1.5 font-medium",
                    unit.isActive ? "text-green-700" : "text-neutral-600",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-2 w-2 rounded-full",
                      unit.isActive ? "bg-green-500" : "bg-neutral-400",
                    ].join(" ")}
                  />
                  {unit.isActive ? "Live" : "Hidden"}
                </span>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {unit.isActive
                    ? "Visible to guests and accepting bookings"
                    : "Not visible to guests"}
                </p>
              </dd>
            </div>

            {/* Reference — replaces the raw unit/project GUIDs */}
            <div className="flex items-center justify-between gap-3 text-sm">
              <dt className="text-neutral-500">Reference</dt>
              <dd className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-medium text-neutral-700">
                  {referenceCode("UNIT", unit.unitId)}
                </span>
                <button
                  type="button"
                  aria-label="Copy reference"
                  title="Copy reference"
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      referenceCode("UNIT", unit.unitId)
                    );
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </dd>
            </div>

            <div className="flex justify-between text-sm">
              <dt className="text-neutral-500">Listed since</dt>
              <dd className="font-medium text-neutral-900">
                {formatDay(unit.createdAt)}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-neutral-500">Last updated</dt>
              <dd className="font-medium text-neutral-900">
                {formatDay(unit.updatedAt)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Amenities placeholder - backend gap */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900">Amenities</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Amenity information is not available in the owner portal at this time.
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() =>
            router.push(`${ROUTES.owner.bookings}?unitId=${unit.unitId}`)
          }
        >
          View Bookings
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            router.push(`${ROUTES.owner.units}/${unit.unitId}/availability`)
          }
        >
          View Availability
        </Button>
      </div>
    </div>
  );
}
