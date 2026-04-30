import Link from "next/link";
import type { OwnerPortalUnitResponse } from "@/lib/types/owner-portal.types";
import { formatCurrency } from "@/lib/utils/format";
import { ROUTES } from "@/lib/constants/routes";

interface OwnerUnitCardProps {
  unit: OwnerPortalUnitResponse;
}

export function OwnerUnitCard({ unit }: OwnerUnitCardProps) {
  return (
    <Link
      href={ROUTES.owner.unitDetail(unit.unitId)}
      className="group block rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md"
    >
      {/* Image placeholder - backend gap */}
      <div className="relative h-48 overflow-hidden rounded-t-lg bg-neutral-100">
        <div className="flex h-full items-center justify-center text-neutral-400">
          <svg
            className="h-16 w-16"
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
        </div>

        {/* Status badge */}
        <div className="absolute right-3 top-3">
          <span
            className={[
              "rounded-full px-2.5 py-1 text-xs font-medium",
              unit.isActive
                ? "bg-green-100 text-green-700"
                : "bg-neutral-100 text-neutral-600",
            ].join(" ")}
          >
            {unit.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
          {unit.unitName}
        </h3>

        <p className="mt-1 text-sm text-neutral-500">{unit.unitType}</p>

        {/* Details */}
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-neutral-600">
          <div className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>{unit.bedrooms} bed</span>
          </div>

          <div className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{unit.bathrooms} bath</span>
          </div>

          <div className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>{unit.maxGuests} guests</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-4 border-t border-neutral-200 pt-3">
          <p className="text-lg font-bold text-neutral-900">
            {formatCurrency(unit.basePricePerNight)}
            <span className="text-sm font-normal text-neutral-500">
              {" "}
              / night
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}
