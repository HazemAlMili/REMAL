import { create } from 'zustand'
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

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  expiresInSeconds: null,
  subjectType: null,
  user: null,
  role: null,

  setAuth: ({ accessToken, expiresInSeconds, subjectType, user, role }) =>
    set({ accessToken, expiresInSeconds, subjectType, user, role }),
  setAccessToken: (token) => set({ accessToken: token }),
  clearAuth: () => set({ accessToken: null, expiresInSeconds: null, subjectType: null, user: null, role: null }),
}))
