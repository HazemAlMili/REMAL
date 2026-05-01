"use client";
import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import { publicService } from "@/lib/api/services/public.service";
import { queryKeys } from "@/lib/utils/query-keys";
import type {
  PublicUnitFilters,
  PublicReviewFilters,
  PublicCreateCrmLeadRequest,
} from "@/lib/types/public.types";

// ═══════════════════════════════════════════
// QUERIES — Server data fetching
// ═══════════════════════════════════════════

// ── Areas ──
export function usePublicAreas() {
  return useQuery({
    queryKey: queryKeys.areas.all,
    queryFn: publicService.getAreas,
    staleTime: 5 * 60 * 1000, // 5 min — areas rarely change
  });
}

// ── Amenities ──
export function usePublicAmenities() {
  return useQuery({
    queryKey: queryKeys.amenities.all,
    queryFn: publicService.getAmenities,
    staleTime: 10 * 60 * 1000, // 10 min — amenities very rarely change
  });
}

// ── Units List (paginated) ──
export function usePublicUnits(filters?: PublicUnitFilters) {
  return useQuery({
    queryKey: queryKeys.units.publicList(filters),
    queryFn: () => publicService.getUnits(filters),
    placeholderData: keepPreviousData, // smooth pagination transitions
  });
}

// ── Unit Detail ──
export function usePublicUnit(id: string) {
  return useQuery({
    queryKey: queryKeys.units.publicById(id),
    queryFn: () => publicService.getUnitById(id),
    enabled: !!id,
  });
}

// ── Unit Images ──
export function useUnitImages(unitId: string) {
  return useQuery({
    queryKey: queryKeys.units.images(unitId),
    queryFn: () => publicService.getUnitImages(unitId),
    enabled: !!unitId,
  });
}

// ── Unit Amenities ──
export function useUnitAmenities(unitId: string) {
  return useQuery({
    queryKey: queryKeys.units.amenities(unitId),
    queryFn: () => publicService.getUnitAmenities(unitId),
    enabled: !!unitId,
  });
}

// ── Unit Reviews (paginated) ──
export function useUnitReviews(unitId: string, params?: PublicReviewFilters) {
  return useQuery({
    queryKey: queryKeys.publicReviews.byUnit(unitId, params),
    queryFn: () => publicService.getUnitReviews(unitId, params),
    enabled: !!unitId,
    placeholderData: keepPreviousData,
  });
}

// ── Unit Review Summary ──
export function useUnitReviewSummary(unitId: string) {
  return useQuery({
    queryKey: queryKeys.publicReviews.summary(unitId),
    queryFn: () => publicService.getUnitReviewSummary(unitId),
    enabled: !!unitId,
  });
}

// ═══════════════════════════════════════════
// MUTATIONS — On-demand actions
// ═══════════════════════════════════════════

// ── Availability Check ──
// Called when user selects dates on the booking form or calendar
export function useCheckAvailability() {
  return useMutation({
    mutationFn: ({
      unitId,
      startDate,
      endDate,
    }: {
      unitId: string;
      startDate: string;
      endDate: string;
    }) => publicService.checkAvailability(unitId, startDate, endDate),
  });
}

// ── Pricing Calculation ──
// Called after date selection to show nightly breakdown + total
export function useCalculatePricing() {
  return useMutation({
    mutationFn: ({
      unitId,
      startDate,
      endDate,
    }: {
      unitId: string;
      startDate: string;
      endDate: string;
    }) => publicService.calculatePricing(unitId, startDate, endDate),
  });
}

// ── Submit Booking Request (CRM Lead) ──
// Called when user submits the booking form — creates a CRM lead, NOT a formal booking
export function useSubmitBookingRequest() {
  return useMutation({
    mutationFn: (data: PublicCreateCrmLeadRequest) =>
      publicService.submitBookingRequest(data),
  });
}
