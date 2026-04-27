import { useState } from 'react'
import { authService } from '@/lib/api/services/auth.service'
import { useAuthStore } from '@/lib/stores/auth.store'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

interface UseLogoutReturn {
  logout: () => Promise<void>
  isLoading: boolean
}

export function useLogout(): UseLogoutReturn {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function logout(): Promise<void> {
    setIsLoading(true)
    try {
      // Step 1: Tell backend to revoke refresh token cookie
      await authService.logout()
    } catch {
      // If logout API fails, still clear local state (fail-safe)
    } finally {
      // Step 2: Read subjectType BEFORE clearing (clearAuth nulls it)
      const subjectType = useAuthStore.getState().subjectType

      // Step 3: Clear local auth state
      useAuthStore.getState().clearAuth()

      // Step 4: Redirect to appropriate login page
      const loginRoute =
        subjectType === 'Owner'
          ? ROUTES.auth.ownerLogin
          : subjectType === 'Client'
            ? ROUTES.auth.clientLogin
            : ROUTES.auth.adminLogin

      router.push(loginRoute)
      setIsLoading(false)
    }
  }

  return { logout, isLoading }
}
