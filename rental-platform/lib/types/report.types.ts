import type {
  BookingAnalyticsSummaryResponse,
  BookingAnalyticsDailySummaryResponse,
  FinanceAnalyticsSummaryResponse,
  FinanceAnalyticsDailySummaryResponse,
} from "./finance.types";

export interface ReportDateFilters {
  dateFrom?: string;
  dateTo?: string;
}

export interface ReportDailyFilters {
  dateFrom?: string;
  dateTo?: string;
}

export type {
  BookingAnalyticsSummaryResponse,
  BookingAnalyticsDailySummaryResponse,
  FinanceAnalyticsSummaryResponse,
  FinanceAnalyticsDailySummaryResponse,
};
