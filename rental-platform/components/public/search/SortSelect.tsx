// ═══════════════════════════════════════════════════════════
// components/public/search/SortSelect.tsx
// Sort dropdown — ⚠️ P34 backend gap
// ═══════════════════════════════════════════════════════════

"use client";
import { Select } from "@/components/ui/Select";

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "cheapest", label: "Price: Low to High" }, // ⚠️ P34
  { value: "highest_rated", label: "Highest Rated" }, // ⚠️ P34
  { value: "most_booked", label: "Most Popular" }, // ⚠️ P34
];

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <Select
      label="Sort by"
      options={SORT_OPTIONS}
      value={value}
      onChange={(val) => onChange(String(val))}
    />
  );
}
