export const UNIT_ACTIVITY_LABELS: Record<'true' | 'false', string> = {
  true: 'Active',
  false: 'Inactive',
}

export function getUnitActivityLabel(isActive: boolean): string {
  return UNIT_ACTIVITY_LABELS[String(isActive) as 'true' | 'false']
}
