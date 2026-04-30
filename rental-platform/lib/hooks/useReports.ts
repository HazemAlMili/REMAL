import { useQuery } from "@tanstack/react-query";
import { reportsService } from "../api/services/reports.service";
import { unitsService } from "../api/services/units.service";
import { queryKeys } from "./query-keys";
import { ReportDateFilters, ReportDailyFilters } from "../types/report.types";

export const useReports = () => {
  return {
    useBookingsSummary: (filters?: ReportDateFilters) =>
      useQuery({
        queryKey: queryKeys.reports.bookingsSummary(filters || {}),
        queryFn: () => reportsService.getBookingsSummary(filters),
      }),

    useFinanceSummary: (filters?: ReportDateFilters) =>
      useQuery({
        queryKey: queryKeys.reports.financeSummary(filters || {}),
        queryFn: () => reportsService.getFinanceSummary(filters),
      }),

    useBookingsDaily: (filters?: ReportDailyFilters) =>
      useQuery({
        queryKey: queryKeys.reports.bookingsDaily(filters || {}),
        queryFn: () => reportsService.getBookingsDaily(filters),
        staleTime: 1000 * 60 * 10, // 10 minutes
      }),

    useFinanceDaily: (filters?: ReportDailyFilters) =>
      useQuery({
        queryKey: queryKeys.reports.financeDaily(filters || {}),
        queryFn: () => reportsService.getFinanceDaily(filters),
        staleTime: 1000 * 60 * 10, // 10 minutes
      }),

    useActiveUnitsCount: () =>
      useQuery({
        // Backend gap: isActive filter is not currently supported by GET /api/internal/units
        queryKey: queryKeys.units.internalList({
          page: 1,
          pageSize: 1,
        }),
        queryFn: () =>
          unitsService.getInternalList({
            page: 1,
            pageSize: 1,
          }),
        select: (data: unknown) => {
          const d = data as Record<string, unknown>;
          return (
            (d?.pagination as { totalCount?: number })?.totalCount ??
            (d?.length as number) ??
            0
          );
        },
      }),
  };
};
