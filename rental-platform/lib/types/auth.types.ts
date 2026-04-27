export type SubjectType = 'Admin' | 'Owner' | 'Client'
export type AdminRole = 'SuperAdmin' | 'Sales' | 'Finance' | 'Tech'

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface PhoneLoginRequest {
  phone: string
  password: string
}

export interface ClientRegisterRequest {
  name: string
  phone: string
  email?: string
  password: string
}

export interface AuthUserPayload {
  userId: string
  identifier: string
  subjectType: SubjectType
  adminRole: AdminRole | null
}

export interface AuthResponse {
  accessToken: string
  expiresInSeconds: number
  subjectType: SubjectType
  adminRole: AdminRole | null
  user: AuthUserPayload
}

export interface ClientProfileResponse {
  id: string
  name: string
  phone: string
  email: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}
