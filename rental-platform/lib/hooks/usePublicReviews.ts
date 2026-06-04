import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { publicService } from "@/lib/api/services/public.service";
import { queryKeys } from "@/lib/utils/query-keys";

/**
 * Hook A: usePublicUnitReviewSummary(unitId)
 * Targets GET /api/public/units/{unitId}/reviews/summary
 */
export function usePublicUnitReviewSummary(unitId: string) {
  return useQuery({
    queryKey: queryKeys.publicReviews.summary(unitId),
    queryFn: () => publicService.getUnitReviewSummary(unitId),
    enabled: !!unitId,
  });
}

/**
 * Hook B: usePublicUnitReviewList(unitId, page)
 * Targets GET /api/public/units/{unitId}/reviews
 */
export function usePublicUnitReviewList(unitId: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.publicReviews.byUnit(unitId, { page, pageSize: 5 }),
    queryFn: () => publicService.getUnitReviews(unitId, { page, pageSize: 5 }),
    enabled: !!unitId,
    placeholderData: keepPreviousData,
  });
}
