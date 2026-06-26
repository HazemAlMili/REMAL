import api from '../axios'
import { endpoints } from '../endpoints'
import { AreaResponse, CreateAreaRequest, UpdateAreaRequest, UpdateAreaStatusRequest } from '@/lib/types/area.types'

export const areasService = {
  getAreas: async (includeInactive: boolean = false): Promise<AreaResponse[]> => {
    return api.get(endpoints.areas.list, { params: { includeInactive } })
  },
  
  createArea: async (data: CreateAreaRequest): Promise<AreaResponse> => {
    return api.post(endpoints.areas.create, data)
  },
  
  updateArea: async (id: string, data: UpdateAreaRequest): Promise<AreaResponse> => {
    return api.put(endpoints.areas.update(id), data)
  },
  
  toggleStatus: async (id: string, data: UpdateAreaStatusRequest): Promise<AreaResponse> => {
    return api.patch(endpoints.areas.status(id), data)
  }
}
