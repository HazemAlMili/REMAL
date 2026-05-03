import { useState } from 'react'
import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { authService } from '@/lib/api/services/auth.service'
import { AdminLoginRequest, AuthResponse, ClientRegisterRequest, PhoneLoginRequest } from '@/lib/types/auth.types'
import { useAuthStore } from '@/lib/stores/auth.store'
import { ApiError } from '@/lib/api/api-error'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

// ── Admin Login ──

interface UseAdminLoginReturn {
  adminLogin: UseMutationResult<AuthResponse, ApiError, AdminLoginRequest>
  isLoading: boolean
}

export function useAdminLogin(): UseAdminLoginReturn {
  const router = useRouter()

  const mutation = useMutation<AuthResponse, ApiError, AdminLoginRequest>({
    mutationFn: (data: AdminLoginRequest) => authService.adminLogin(data),
    onSuccess: (response) => {
      useAuthStore.getState().setAuth({
        accessToken: response.accessToken,
        expiresInSeconds: response.expiresInSeconds,
        subjectType: response.subjectType,
        user: response.user,
        role: response.adminRole,
      })
      router.push(ROUTES.admin.dashboard)
    },
  })

  return { adminLogin: mutation, isLoading: mutation.isPending }
}

// ── Owner Login ──

interface UseOwnerLoginReturn {
  ownerLogin: UseMutationResult<AuthResponse, ApiError, PhoneLoginRequest>
  isLoading: boolean
}

export function useOwnerLogin(): UseOwnerLoginReturn {
  const router = useRouter()

  const mutation = useMutation<AuthResponse, ApiError, PhoneLoginRequest>({
    mutationFn: (data: PhoneLoginRequest) => authService.ownerLogin(data),
    onSuccess: (response) => {
      useAuthStore.getState().setAuth({
        accessToken: response.accessToken,
        expiresInSeconds: response.expiresInSeconds,
        subjectType: response.subjectType, // 'Owner'
        user: response.user,
        role: 'Owner',
      })
      router.push(ROUTES.owner.dashboard)
    },
  })

  return { ownerLogin: mutation, isLoading: mutation.isPending }
}

// ── Client Login ──

interface UseClientLoginReturn {
  clientLogin: UseMutationResult<AuthResponse, ApiError, PhoneLoginRequest>
  isLoading: boolean
}

export function useClientLogin(): UseClientLoginReturn {
  const router = useRouter()

  const mutation = useMutation<AuthResponse, ApiError, PhoneLoginRequest>({
    mutationFn: (data: PhoneLoginRequest) => authService.clientLogin(data),
    onSuccess: (response) => {
      useAuthStore.getState().setAuth({
        accessToken: response.accessToken,
        expiresInSeconds: response.expiresInSeconds,
        subjectType: response.subjectType, // 'Client'
        user: response.user,
        role: 'Client',
      })
      router.push(ROUTES.client.account)
    },
  })

  return { clientLogin: mutation, isLoading: mutation.isPending }
}

// ── Client Register (two-step: register → auto-login) ──

interface UseClientRegisterReturn {
  register: (data: ClientRegisterRequest) => Promise<void>
  isLoading: boolean
  error: string | null
}

export function useClientRegister(): UseClientRegisterReturn {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function register(data: ClientRegisterRequest): Promise<void> {
    setIsLoading(true)
    setError(null)
    try {
      // Step 1: Register — returns ClientProfileResponse (no token)
      await authService.clientRegister(data)

      // Step 2: Auto-login with the same phone + password
      const loginResponse = await authService.clientLogin({
        phone: data.phone,
        password: data.password,
      })

      // Step 3: Populate auth store
      useAuthStore.getState().setAuth({
        accessToken: loginResponse.accessToken,
        expiresInSeconds: loginResponse.expiresInSeconds,
        subjectType: loginResponse.subjectType,
        user: loginResponse.user,
        role: 'Client',
      })

      router.push(ROUTES.client.account)
    } catch (err) {
      // Rethrow so the form can handle field-level 422 errors.
      // The hook's isLoading will be reset in finally.
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { register, isLoading, error }
}

