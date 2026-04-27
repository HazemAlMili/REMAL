export const UNIT_TYPES = {
  villa: 'villa',
  chalet: 'chalet',
  studio: 'studio',
} as const

export type UnitType = (typeof UNIT_TYPES)[keyof typeof UNIT_TYPES]

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  villa: 'Villa',
  chalet: 'Chalet',
  studio: 'Studio',
}
