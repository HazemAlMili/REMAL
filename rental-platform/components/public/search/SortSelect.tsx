// ═══════════════════════════════════════════════════════════
// components/public/search/SortSelect.tsx
// Sort dropdown
// ═══════════════════════════════════════════════════════════

"use client";
import { Select } from "@/components/ui/Select";

const SORT_OPTIONS = [
  { value: "", label: "Newest Arrivals" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
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
