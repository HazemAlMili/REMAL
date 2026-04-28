'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { SelectOption } from './Select'

export interface ComboboxProps<T = string | number> {
  label?: string
  error?: string
  options: SelectOption<T>[]
  value?: T | null
  onChange: (value: T | null) => void
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
}

export function Combobox<T = string | number>({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  searchable = true,
}: ComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  )

  const filteredOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options
    const lowerQuery = query.toLowerCase()
    return options.filter((opt) => opt.label.toLowerCase().includes(lowerQuery))
  }, [options, query, searchable])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Clear query when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
    }
  }, [isOpen])

  const handleSelect = (selectedValue: T) => {
    onChange(selectedValue)
    setIsOpen(false)
  }

  const handleClear = () => {
    if (!disabled) {
      onChange(null)
    }
  }

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={cn(
            'w-full h-10 px-3.5 rounded-lg border text-left text-sm flex items-center justify-between',
            'bg-white transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            disabled ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed' : 'text-neutral-800',
            error ? 'border-error focus:ring-error' : 'border-neutral-300'
          )}
        >
          <span className={cn('truncate', !selectedOption && 'text-neutral-400')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center shrink-0">
            {value !== null && value !== undefined && !disabled && (
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
                className="text-neutral-400 hover:text-neutral-600 text-lg leading-none mr-2"
                aria-label="Clear selection"
              >
                &times;
              </span>
            )}
            <span className="text-neutral-400 text-xs">&#9660;</span>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full border rounded-lg bg-white shadow-lg max-h-60 flex flex-col focus:outline-none">
            {searchable && (
              <div className="sticky top-0 bg-white border-b p-2 shrink-0">
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            )}

            <div className="py-1 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-neutral-400">No results found</div>
              ) : (
                filteredOptions.map((opt) => (
                  <div
                    key={String(opt.value)}
                    onClick={() => {
                      if (!opt.disabled) {
                        handleSelect(opt.value)
                      }
                    }}
                    className={cn(
                      'px-3 py-2 cursor-pointer text-sm',
                      opt.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-100',
                      selectedOption?.value === opt.value && 'bg-primary-50 text-primary-700'
                    )}
                  >
                    {opt.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  )
}
