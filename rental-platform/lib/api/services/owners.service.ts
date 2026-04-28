import api from "../axios";
import { endpoints } from "../endpoints";
import {
  PaginatedOwners,
  OwnerListFilters,
  OwnerDetailsResponse,
} from "@/lib/types";

export const ownersService = {
  // Public / Internal based on endpoint
  getAll: async (filters?: OwnerListFilters): Promise<PaginatedOwners> => {
    const { data } = await api.get(endpoints.owners.list, { params: filters });
    return data;
  },

  getById: async (id: string): Promise<OwnerDetailsResponse> => {
    const { data } = await api.get(endpoints.owners.byId(id));
    return data;
  },
};
