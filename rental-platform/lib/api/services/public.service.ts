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
import type { ProjectResponse } from "@/lib/types/project.types";
import type { AmenityResponse } from "@/lib/types/amenity.types";
import type {
  UnitImageResponse,
  UnitAmenityResponse,
  OperationalAvailabilityResponse,
  UnitPricingResponse,
} from "@/lib/types/unit.types";

function serializePublicUnitFilters(filters?: PublicUnitFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === null) return;

    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => params.append(key, item));
      return;
    }

    params.set(key, String(value));
  });

  return params.toString();
}

export const publicService = {
  // ── Projects (for landing page + search filters) ──
  getProjects: (): Promise<ProjectResponse[]> =>
    api.get(endpoints.projects.list),

  // ── Amenities (for search filter chips) ──
  getAmenities: (): Promise<AmenityResponse[]> =>
    api.get(endpoints.amenities.list),

  // ── Units ──
  getUnits: (filters?: PublicUnitFilters): Promise<PaginatedPublicUnits> =>
    api.get(endpoints.units.publicList, {
      params: filters,
      paramsSerializer: { serialize: serializePublicUnitFilters },
    }),

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
    api.post(endpoints.crmLeads.publicCreate, data),
};
