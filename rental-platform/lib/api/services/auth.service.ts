import axios from 'axios'
import api from '@/lib/api/axios'
import { endpoints } from '@/lib/api/endpoints'
import type { ApiResponse } from '@/lib/api/types'
import {
  AdminLoginRequest,
  AuthResponse,
  ClientProfileResponse,
  ClientRegisterRequest,
  PhoneLoginRequest,
} from '@/lib/types/auth.types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const authService = {
  adminLogin: (data: AdminLoginRequest): Promise<AuthResponse> =>
    api.post(endpoints.auth.adminLogin, data),

  ownerLogin: (data: PhoneLoginRequest): Promise<AuthResponse> =>
    api.post(endpoints.auth.ownerLogin, data),

  clientLogin: (data: PhoneLoginRequest): Promise<AuthResponse> =>
    api.post(endpoints.auth.clientLogin, data),

  clientRegister: (data: ClientRegisterRequest): Promise<ClientProfileResponse> =>
    api.post(endpoints.auth.clientRegister, data),

  logout: (): Promise<string> =>
    api.post(endpoints.auth.logout),

  /**
   * Refresh the access token using the HttpOnly refresh cookie.
   * Uses a raw axios instance (not the intercepted `api`) to avoid
   * triggering the 401 interceptor loop.
   */
  refresh: async (): Promise<string | null> => {
    const response = await axios.post(
      `${API_URL}${endpoints.auth.refresh}`,
      {},
      { withCredentials: true }
    )
    return (response.data as ApiResponse<{ accessToken: string }>).data?.accessToken ?? null
  },
}

