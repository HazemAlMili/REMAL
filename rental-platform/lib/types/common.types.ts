export type { ApiResponse, PaginationMeta } from '@/lib/api/types'

export type Maybe<T> = T | null | undefined

export interface ListFilters {
  page?: number
  pageSize?: number
  search?: string
}

export interface SelectOption<T = string> {
  value: T
  label: string
}
