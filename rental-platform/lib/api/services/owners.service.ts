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
  getAll: (filters?: OwnerListFilters): Promise<PaginatedOwners> =>
    api.get(endpoints.owners.list, { params: filters }),

  getById: (id: string): Promise<OwnerDetailsResponse> =>
    api.get(endpoints.owners.byId(id)),

  create: (data: CreateOwnerRequest): Promise<OwnerDetailsResponse> =>
    api.post(endpoints.owners.create, data),

  update: (
    id: string,
    data: UpdateOwnerRequest
  ): Promise<OwnerDetailsResponse> =>
    api.put(endpoints.owners.update(id), data),

  updateStatus: (
    id: string,
    status: OwnerStatus
  ): Promise<OwnerDetailsResponse> =>
    api.patch(endpoints.owners.status(id), { status }),

  getPayouts: (id: string): Promise<OwnerPayoutResponse[]> =>
    api.get(endpoints.ownerPayouts.byOwner(id)),

  getOwnerPayoutSummary: (
    id: string
  ): Promise<OwnerPayoutSummaryResponse> =>
    api.get(endpoints.financeSummary.ownerPayoutSummary(id)),
};
