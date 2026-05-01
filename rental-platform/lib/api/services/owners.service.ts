import api from "../axios";
import { endpoints } from "../endpoints";
import {
  PaginatedOwners,
  OwnerListFilters,
  OwnerDetailsResponse,
  CreateOwnerRequest,
  UpdateOwnerRequest,
  OwnerStatus,
} from "@/lib/types/owner.types";
import {
  OwnerPayoutResponse,
  OwnerPayoutSummaryResponse,
} from "@/lib/types/finance.types";

export const ownersService = {
  getAll: async (filters?: OwnerListFilters): Promise<PaginatedOwners> => {
    const { data } = await api.get(endpoints.owners.list, { params: filters });
    return data;
  },

  getById: async (id: string): Promise<OwnerDetailsResponse> => {
    const { data } = await api.get(endpoints.owners.byId(id));
    return data;
  },

  create: async (data: CreateOwnerRequest): Promise<OwnerDetailsResponse> => {
    const response = await api.post(endpoints.owners.create, data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateOwnerRequest
  ): Promise<OwnerDetailsResponse> => {
    const response = await api.put(endpoints.owners.update(id), data);
    return response.data;
  },

  updateStatus: async (
    id: string,
    status: OwnerStatus
  ): Promise<OwnerDetailsResponse> => {
    const response = await api.patch(endpoints.owners.status(id), { status });
    return response.data;
  },

  getPayouts: async (id: string): Promise<OwnerPayoutResponse[]> => {
    const { data } = await api.get(endpoints.ownerPayouts.byOwner(id));
    return data;
  },

  getOwnerPayoutSummary: async (
    id: string
  ): Promise<OwnerPayoutSummaryResponse> => {
    const { data } = await api.get(endpoints.financeSummary.ownerPayoutSummary(id));
    return data;
  },
};
