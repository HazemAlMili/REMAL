"use client";
import { User, Phone, Mail, Percent } from "lucide-react";

interface OwnerProfileCardProps {
  name: string;
  phone: string;
  email: string | null;
  commissionRate?: number;
}

export function OwnerProfileCard({
  name,
  phone,
  email,
  commissionRate,
}: OwnerProfileCardProps) {
  return (
    <div className="max-w-2xl overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
        <h2 className="text-lg font-semibold text-neutral-800">
          Account Information
        </h2>
      </div>

      {/* Details */}
      <div className="divide-y divide-neutral-100">
        {/* Name */}
        <div className="flex items-center gap-4 px-6 py-4">
          <User className="h-5 w-5 flex-shrink-0 text-neutral-400" />
          <div className="flex-1">
            <p className="text-xs text-neutral-500">Name</p>
            <p className="text-sm font-medium text-neutral-800">{name}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-4 px-6 py-4">
          <Phone className="h-5 w-5 flex-shrink-0 text-neutral-400" />
          <div className="flex-1">
            <p className="text-xs text-neutral-500">Phone</p>
            <p className="text-sm font-medium text-neutral-800">{phone}</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-4 px-6 py-4">
          <Mail className="h-5 w-5 flex-shrink-0 text-neutral-400" />
          <div className="flex-1">
            <p className="text-xs text-neutral-500">Email</p>
            <p className="text-sm font-medium text-neutral-800">
              {email ?? (
                <span className="italic text-neutral-400">Not on file</span>
              )}
            </p>
          </div>
        </div>

        {/* Commission Rate */}
        {commissionRate !== undefined && (
          <div className="flex items-center gap-4 px-6 py-4">
            <Percent className="h-5 w-5 flex-shrink-0 text-neutral-400" />
            <div className="flex-1">
              <p className="text-xs text-neutral-500">Commission Rate</p>
              <p className="text-sm font-medium text-neutral-800">
                {commissionRate}%{" "}
                {/* P16: API returns 20.00, display as "20%" — NO multiply by 100 */}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
