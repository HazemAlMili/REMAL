import type { PaginationMeta } from "@/lib/api/types";

// ── Client list item (from GET /api/clients) ──
// Per API Reference Section 12 / P33: totalBookings does NOT exist in list response
export interface ClientListItemResponse {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
}

// ── Client detail (from GET /api/clients/{id}) ──
export interface ClientDetailsResponse {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Client filters (from API Reference Section 12) ──
// API documents: includeInactive, page, pageSize (NOT search, NOT isActive)
export interface ClientListFilters {
  includeInactive?: boolean;
  page?: number;
  pageSize?: number;
}

// ── Paginated Clients ──
export interface PaginatedClients {
  items: ClientListItemResponse[];
  pagination: PaginationMeta;
}
