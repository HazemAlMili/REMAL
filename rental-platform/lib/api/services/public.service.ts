// ═══════════════════════════════════════════════════════════
// lib/api/services/public.service.ts
// All public-facing API calls for the Guest App
// ═══════════════════════════════════════════════════════════

import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import type {
  PaginatedPublicUnits,
  PublicUnitDetail,
  PublicUnitFilters,
  PublicCreateCrmLeadRequest,
  PublicCreateCrmLeadResponse,
  PublishedReviewListItem,
  PublicReviewSummary,
  PublicReviewFilters,
} from "@/lib/types/public.types";
import type { AreaResponse } from "@/lib/types/area.types";
import type { AmenityResponse } from "@/lib/types/amenity.types";
import type {
  UnitImageResponse,
  UnitAmenityResponse,
  OperationalAvailabilityResponse,
  UnitPricingResponse,
} from "@/lib/types/unit.types";

export const publicService = {
  // ── Areas (for landing page + search filters) ──
  getAreas: (): Promise<AreaResponse[]> => api.get(endpoints.areas.list),

  // ── Amenities (for search filter chips) ──
  getAmenities: (): Promise<AmenityResponse[]> =>
    api.get(endpoints.amenities.list),

  // ── Units ──
  getUnits: (filters?: PublicUnitFilters): Promise<PaginatedPublicUnits> =>
    api.get(endpoints.units.publicList, { params: filters }),

  getUnitById: (id: string): Promise<PublicUnitDetail> =>
    api.get(endpoints.units.publicById(id)),

  getUnitImages: (unitId: string): Promise<UnitImageResponse[]> =>
    api.get(endpoints.units.images(unitId)),

  getUnitAmenities: (unitId: string): Promise<UnitAmenityResponse[]> =>
    api.get(endpoints.units.amenities(unitId)),

  // ── Reviews (public — P23: NO clientName in response) ──
  getUnitReviews: (
    unitId: string,
    params?: PublicReviewFilters
  ): Promise<PublishedReviewListItem[]> =>
    api.get(endpoints.publicReviews.byUnitList(unitId), { params }),

  getUnitReviewSummary: (unitId: string): Promise<PublicReviewSummary> =>
    api.get(endpoints.publicReviews.byUnitSummary(unitId)),

  // ── Availability Check (P04: startDate/endDate, NOT checkInDate/checkOutDate) ──
  checkAvailability: (
    unitId: string,
    startDate: string,
    endDate: string
  ): Promise<OperationalAvailabilityResponse> =>
    api.post(endpoints.units.operationalCheck(unitId), { startDate, endDate }),

  // ── Pricing Calculation (P05: startDate/endDate, NOT checkInDate/checkOutDate) ──
  calculatePricing: (
    unitId: string,
    startDate: string,
    endDate: string
  ): Promise<UnitPricingResponse> =>
    api.post(endpoints.units.pricingCalculate(unitId), { startDate, endDate }),

  // ── CRM Lead (booking form submission — public, no auth) ──
  submitBookingRequest: (
    data: PublicCreateCrmLeadRequest
  ): Promise<PublicCreateCrmLeadResponse> =>
    api.post(endpoints.crmLeads.create, data),
};
