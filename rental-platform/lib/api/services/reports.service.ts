import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import type {
  BookingAnalyticsSummaryResponse,
  BookingAnalyticsDailySummaryResponse,
  FinanceAnalyticsSummaryResponse,
  FinanceAnalyticsDailySummaryResponse,
  ReportDateFilters,
  ReportDailyFilters,
} from "@/lib/types/report.types";

export const reportsService = {
  getBookingsSummary: async (
    filters?: ReportDateFilters
  ): Promise<BookingAnalyticsSummaryResponse> => {
    return api.get(endpoints.reportsBookings.summary, { params: filters });
  },

  getBookingsDaily: async (
    filters?: ReportDailyFilters
  ): Promise<BookingAnalyticsDailySummaryResponse[]> => {
    return api.get(endpoints.reportsBookings.daily, { params: filters });
  },

  getFinanceSummary: async (
    filters?: ReportDateFilters
  ): Promise<FinanceAnalyticsSummaryResponse> => {
    return api.get(endpoints.reportsFinance.summary, { params: filters });
  },

  getFinanceDaily: async (
    filters?: ReportDailyFilters
  ): Promise<FinanceAnalyticsDailySummaryResponse[]> => {
    return api.get(endpoints.reportsFinance.daily, { params: filters });
  },
};
