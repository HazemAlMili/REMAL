export interface ReportFilters {
  startDate?: string;
  endDate?: string;
}

export interface BookingsSummaryResponse {
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  statusBreakdown: {
    status: string;
    count: number;
  }[];
}

export interface FinanceSummaryResponse {
  totalRevenue: number;
  totalCommissionEarned: number;
  totalPaidToOwners: number;
  totalOutstanding: number;
}
