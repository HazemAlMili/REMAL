import { create } from 'zustand'

export type AuthRole = 'SuperAdmin' | 'Sales' | 'Finance' | 'Tech' | 'Owner' | 'Client' | null

export interface AuthenticatedUserResponse {
  userId: string
  identifier: string
  subjectType: 'Admin' | 'Owner' | 'Client'
  adminRole: 'SuperAdmin' | 'Sales' | 'Finance' | 'Tech' | null
}

interface AuthState {
  accessToken: string | null
  user: AuthenticatedUserResponse | null
  role: AuthRole

  setAuth: (payload: { accessToken: string; user: AuthenticatedUserResponse; role: AuthRole }) => void
  setAccessToken: (token: string | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  role: null,

  setAuth: ({ accessToken, user, role }) => set({ accessToken, user, role }),
  setAccessToken: (token) => set({ accessToken: token }),
  clearAuth: () => set({ accessToken: null, user: null, role: null }),
}))
