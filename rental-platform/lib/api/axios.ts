import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiError } from './api-error'
import type { ApiResponse } from './types'
import { endpoints } from './endpoints'

const API_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined')
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ───── Request Interceptor ─────
api.interceptors.request.use((config) => {
  // TODO (FE-1-AUTH-05): import useAuthStore from '@/lib/stores/auth.store'
  //                      const token = useAuthStore.getState().accessToken
  //                      if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ───── Refresh state ─────
let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

// ───── Response Interceptor ─────
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const envelope = response.data as ApiResponse<unknown>
    if (envelope?.success === false) {
      throw new ApiError(response.status, envelope.message ?? 'Request failed', envelope.errors ?? [])
    }
    // Unwrap: return the inner `data` field directly
    return envelope.data as unknown as AxiosResponse
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // ── No response (network error) ──
    if (!error.response) {
      // TODO (FE-1-UI-09): toast.error('Cannot reach the server. Check your connection.')
      throw new ApiError(0, 'Cannot reach the server')
    }

    const { status, data } = error.response
    const message = data?.message ?? 'Request failed'
    const errors = data?.errors ?? []

    // ── 401: try refresh once ──
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        // queue this request until the in-flight refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              resolve(api(originalRequest))
            } else {
              reject(new ApiError(401, 'Session expired'))
            }
          })
        })
      }

      isRefreshing = true
      try {
        const refreshResponse = await axios.post(
          `${API_URL}${endpoints.auth.refresh}`,
          {},
          { withCredentials: true }
        )
        const newToken = (refreshResponse.data as ApiResponse<{ accessToken: string }>).data?.accessToken ?? null

        // TODO (FE-1-AUTH-05): useAuthStore.getState().setAccessToken(newToken)

        refreshQueue.forEach((cb) => cb(newToken))
        refreshQueue = []
        isRefreshing = false

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
        throw new ApiError(401, 'Session expired')
      } catch {
        refreshQueue.forEach((cb) => cb(null))
        refreshQueue = []
        isRefreshing = false

        // TODO (FE-1-AUTH-05): useAuthStore.getState().clearAuth()
        //                      router.push('/auth/...login') — depends on which app

        throw new ApiError(401, 'Session expired')
      }
    }

    // ── 403 ──
    if (status === 403) {
      // TODO (FE-1-UI-09): toast.error('You don\'t have permission to perform this action')
      throw new ApiError(403, message, errors)
    }

    // ── 500+ ──
    if (status >= 500) {
      // TODO (FE-1-UI-09): toast.error('Something went wrong. Please try again.')
      throw new ApiError(status, message, errors)
    }

    // ── 400 / 404 / 422 / others — let caller handle ──
    throw new ApiError(status, message, errors)
  }
)

export default api
