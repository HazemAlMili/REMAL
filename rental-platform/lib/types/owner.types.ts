export interface OwnerListItemResponse {
  id: string;
  name: string;
  phone: string;
  email?: string;
  commissionRate: number;
  status: string; // "active" | "inactive" 
  createdAt: string;
}

export interface OwnerDetailsResponse extends OwnerListItemResponse {
  notes?: string;
  updatedAt: string;
}

export interface PaginatedOwners {
  items: OwnerListItemResponse[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface OwnerListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}
