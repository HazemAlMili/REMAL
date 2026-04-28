'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

export interface DateRange {
  from: Date | null
  to: Date | null
}

export interface DateRangePickerProps {
  label?: string
  value: DateRange
  onChange: (range: DateRange) => void
  placeholder?: string
  error?: string
  minDate?: Date
  maxDate?: Date
}

export function DateRangePicker({
  label,
  value,
  placeholder,
  error,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="w-full">
      {label && <label className="block text-sm mb-1.5 text-neutral-800 font-medium">{label}</label>}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full h-10 px-3.5 border rounded-lg text-left text-sm transition-colors',
          error
            ? 'border-error text-error focus:ring-error/20'
            : 'border-neutral-300 text-neutral-800 hover:border-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
          (!value.from || !value.to) && !error && 'text-neutral-500'
        )}
      >
        {value.from && value.to
          ? `${value.from.toDateString()} → ${value.to.toDateString()}`
          : placeholder || 'Select date range'}
      </button>

      {open && (
        <div className="mt-2 border rounded-lg p-3 bg-white shadow-lg absolute z-50">
          <p className="text-sm text-neutral-500">Range calendar UI here</p>
        </div>
      )}

      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  )
}
