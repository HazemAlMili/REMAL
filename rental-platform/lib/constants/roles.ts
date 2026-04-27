export const ADMIN_ROLES = {
  SuperAdmin: 'SuperAdmin',
  Sales: 'Sales',
  Finance: 'Finance',
  Tech: 'Tech',
} as const

export type AdminRole = (typeof ADMIN_ROLES)[keyof typeof ADMIN_ROLES]

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  SuperAdmin: 'Super Admin',
  Sales: 'Sales',
  Finance: 'Finance',
  Tech: 'Tech',
}
