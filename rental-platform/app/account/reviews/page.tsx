// ═══════════════════════════════════════════════════════════
// app/account/reviews/page.tsx
// Client reviews page — placeholder for FE-7-ACC-03
// ═══════════════════════════════════════════════════════════

"use client";
import { Star } from "lucide-react";

export default function AccountReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Reviews
        </h1>
        <p className="mt-1 text-neutral-600">
          Write and manage your property reviews
        </p>
      </div>

      {/* Placeholder for FE-7-ACC-03 */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-12 text-center shadow-card">
        <Star className="mx-auto mb-4 h-16 w-16 text-neutral-300" />
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          Your reviews will appear here
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          This page will be implemented in FE-7-ACC-03
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          Write reviews for properties you&apos;ve stayed at
        </p>
      </div>
    </div>
  );
}
