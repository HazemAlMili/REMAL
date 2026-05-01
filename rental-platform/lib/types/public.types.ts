// ═══════════════════════════════════════════════════════════
// lib/types/public.types.ts
// All public-facing types — field names per API Reference
// ═══════════════════════════════════════════════════════════

import type { PaginationMeta } from "@/lib/types/common.types";

// ── Public Unit List Item ──
// (from GET /api/units — public endpoint, API Reference §5)
export interface PublicUnitListItem {
  id: string; // public uses 'id' (NOT 'unitId' — that's owner portal per P30)
  ownerId: string;
  areaId: string;
  name: string; // public uses 'name' (NOT 'unitName' — that's owner portal per P30)
  unitType: string; // 'villa' | 'chalet' | 'studio' (LOWERCASE per enum rules)
  bedrooms: number;
  bathrooms: number;
  maxGuests: number; // NOT 'capacity' or 'numberOfGuests' per P01
  basePricePerNight: number;
  isActive: boolean; // NOT 'status: UnitStatus' per P01
  createdAt: string;
}

// ── Public Unit Detail ──
// (from GET /api/units/{id} — API Reference §5)
export interface PublicUnitDetail {
  id: string;
  ownerId: string;
  areaId: string;
  name: string;
  description: string | null; // optional at creation — may be null
  address: string | null; // optional at creation — may be null
  unitType: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  basePricePerNight: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Public Unit Search Filters ──
// Only page + pageSize are documented for GET /api/units (API Reference §5)
// ⚠️ P34: areaId, type, minGuests, minPrice, maxPrice, sortBy, search
//    are NOT documented — NEEDS BACKEND CONFIRMATION before adding
export interface PublicUnitFilters {
  page?: number;
  pageSize?: number;
}

// ── Paginated Public Units ──
// Frontend wrapper combining data array + envelope pagination
export interface PaginatedPublicUnits {
  items: PublicUnitListItem[];
  pagination: PaginationMeta; // { page, pageSize, totalCount, totalPages }
}

// ── Published Review List Item ──
// (from GET /api/public/units/{unitId}/reviews — API Reference §23)
// ⚠️ P23: NO clientName — public reviews do NOT include client info
export interface PublishedReviewListItem {
  reviewId: string; // NOT 'id' — public reviews use 'reviewId'
  unitId: string;
  rating: number; // 1–5
  title: string;
  comment: string | null;
  publishedAt: string;
  ownerReplyText: string | null;
  ownerReplyUpdatedAt: string | null;
}

// ── Public Review Summary ──
// (from GET /api/public/units/{unitId}/reviews/summary — API Reference §23)
// ⚠️ P22: NOT { totalReviews, ratingBreakdown } — those are WRONG
export interface PublicReviewSummary {
  unitId: string;
  publishedReviewCount: number; // NOT 'totalReviews'
  averageRating: number;
  lastReviewPublishedAt: string;
}

// ── Public Review Filters ──
// (from GET /api/public/units/{unitId}/reviews — API Reference §23)
export interface PublicReviewFilters {
  page?: number;
  pageSize?: number;
}

// ── Public CRM Lead Request ──
// (from POST /api/crm/leads — API Reference §13)
// ⚠️ P06: uses 'targetUnitId' (NOT 'unitId'), 'guestCount' (NOT 'numberOfGuests'),
//    'desiredCheckInDate'/'desiredCheckOutDate' (NOT 'checkInDate'/'checkOutDate')
export interface PublicCreateCrmLeadRequest {
  clientId?: string; // optional — if client is logged in
  targetUnitId?: string; // NOT 'unitId' per P06
  contactName: string; // required if no clientId
  contactPhone: string; // required if no clientId
  contactEmail?: string; // optional
  desiredCheckInDate?: string; // NOT 'checkInDate' per P06
  desiredCheckOutDate?: string; // NOT 'checkOutDate' per P06
  guestCount?: number; // NOT 'numberOfGuests' per P06
  source: string; // 'Website' | 'App' | 'WhatsApp' | 'PhoneCall' | 'Referral'
  notes?: string; // optional — client message
}

// ── Public CRM Lead Response ──
// (from POST /api/crm/leads — API Reference §13)
export interface PublicCreateCrmLeadResponse {
  id: string; // NOT 'leadId' per P06
  clientId: string | null;
  targetUnitId: string | null;
  assignedAdminUserId: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  desiredCheckInDate: string | null;
  desiredCheckOutDate: string | null;
  guestCount: number | null;
  leadStatus: string; // 'Prospecting' on creation
  source: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Availability Check Request (body) ──
// (from POST /api/units/{unitId}/availability/operational-check — API Reference §8)
// ⚠️ P04: uses 'startDate'/'endDate' (NOT 'checkInDate'/'checkOutDate')
export interface AvailabilityCheckRequest {
  startDate: string; // ISO date, e.g., '2026-06-01'
  endDate: string; // ISO date, e.g., '2026-06-05'
}

// ── Pricing Calculate Request (body) ──
// (from POST /api/units/{unitId}/pricing/calculate — API Reference §8)
// ⚠️ P05: uses 'startDate'/'endDate' (NOT 'checkInDate'/'checkOutDate')
export interface PricingCalculateRequest {
  startDate: string;
  endDate: string;
}
