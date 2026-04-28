import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import {
  BookingsSummaryResponse,
  FinanceSummaryResponse,
  ReportFilters,
} from "@/lib/types/report.types";

export const reportsService = {
  getBookingsSummary: async (
    filters?: ReportFilters
  ): Promise<BookingsSummaryResponse> => {
    return api.get(endpoints.reportsBookings.summary, { params: filters });
  },

  getFinanceSummary: async (
    filters?: ReportFilters
  ): Promise<FinanceSummaryResponse> => {
    return api.get(endpoints.reportsFinance.summary, { params: filters });
  },
};
