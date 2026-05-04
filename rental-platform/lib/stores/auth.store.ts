import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUserPayload, SubjectType, AdminRole } from '@/lib/types/auth.types'

export type AuthRole = AdminRole | 'Owner' | 'Client' | null

interface AuthState {
  accessToken: string | null
  expiresInSeconds: number | null
  subjectType: SubjectType | null
  user: AuthUserPayload | null
  role: AuthRole

  setAuth: (payload: {
    accessToken: string
    expiresInSeconds: number
    subjectType: SubjectType
    user: AuthUserPayload
    role: AuthRole
  }) => void
  setAccessToken: (token: string | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      expiresInSeconds: null,
      subjectType: null,
      user: null,
      role: null,

      setAuth: ({ accessToken, expiresInSeconds, subjectType, user, role }) =>
        set({ accessToken, expiresInSeconds, subjectType, user, role }),
      setAccessToken: (token) => set({ accessToken: token }),
      clearAuth: () => set({ accessToken: null, expiresInSeconds: null, subjectType: null, user: null, role: null }),
    }),
    {
      name: 'remal-auth',
      // Only persist non-sensitive identity data — access token stays in memory
      partialize: (state) => ({
        subjectType: state.subjectType,
        user: state.user,
        role: state.role,
      }),
    }
  )
)
