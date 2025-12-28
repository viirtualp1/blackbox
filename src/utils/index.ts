import { LatLng } from 'leaflet'
import type { LocationData } from '@/types/data'

export interface SafeParseNumberOptions {
  defaultValue?: number
  fieldName?: string
}

export function safeParseNumber(
  value: string | number,
  { defaultValue, fieldName }: SafeParseNumberOptions = {},
): number {
  if (typeof value === 'string' && value.trim() === '') {
    if (defaultValue !== undefined) return defaultValue
    throw new Error(
      `Cannot parse an empty string as a number for field: ${fieldName}`,
    )
  }

  const parsed = typeof value === 'number' ? value : parseFloat(value)
  if (isNaN(parsed)) {
    if (defaultValue !== undefined) return defaultValue
    throw new Error(`Invalid number: ${value} for field: ${fieldName}`)
  }

  return parsed
}

export function compareObjectsRecursively(
  obj1: Record<string, any>,
  obj2: Record<string, any>,
): boolean {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false
    }

    const val1 = obj1[key]
    const val2 = obj2[key]

    if (typeof val1 === 'object' && typeof val2 === 'object') {
      if (!compareObjectsRecursively(val1, val2)) {
        return false
      }
    } else if (val1 !== val2) {
      return false
    }
  }

  return true
}

export function getDistanceBetweenPoints(
  coordinates: LocationData,
  coordinates1: LocationData,
) {
  const dist = new LatLng(coordinates.lat, coordinates.lng).distanceTo(
    new LatLng(coordinates1.lat, coordinates1.lng),
  )

  if (
    typeof coordinates.alt === 'number' &&
    typeof coordinates1.alt === 'number'
  ) {
    const altitudeDiff = coordinates.alt - coordinates1.alt
    return Math.sqrt(dist ** 2 + altitudeDiff ** 2)
  }

  return dist
}
