import { describe, it, expect } from 'vitest'
import {
  resampleData,
  linearInterpolate,
  circularInterpolate,
  circularInterpolateRadians,
} from './resampler'
import type { LogRecord } from '../types'

describe('linearInterpolate', () => {
  it('should interpolate correctly between two values', () => {
    expect(linearInterpolate(0, 10, 0.5)).toBe(5)
    expect(linearInterpolate(0, 10, 0)).toBe(0)
    expect(linearInterpolate(0, 10, 1)).toBe(10)
    expect(linearInterpolate(10, 20, 0.25)).toBe(12.5)
  })

  it('should handle negative values', () => {
    expect(linearInterpolate(-10, 10, 0.5)).toBe(0)
    expect(linearInterpolate(-5, -2, 0.5)).toBe(-3.5)
  })
})

describe('circularInterpolate', () => {
  it('should interpolate correctly for normal angles', () => {
    expect(circularInterpolate(10, 20, 0.5)).toBe(15)
    expect(circularInterpolate(0, 90, 0.5)).toBe(45)
  })

  it('should handle crossing 0/360 boundary correctly', () => {
    // From 350° to 10° should go through 0°, not through 180°
    expect(circularInterpolate(350, 10, 0.5)).toBe(0)
    expect(circularInterpolate(350, 10, 0.25)).toBe(355)
    expect(circularInterpolate(350, 10, 0.75)).toBe(5)
  })

  it('should handle reverse crossing (10° to 350°)', () => {
    expect(circularInterpolate(10, 350, 0.5)).toBe(0)
    expect(circularInterpolate(10, 350, 0.25)).toBe(5)
    expect(circularInterpolate(10, 350, 0.75)).toBe(355)
  })

  it('should handle large angle differences correctly', () => {
    // From 90° to 270° - shortest path is 180°
    expect(circularInterpolate(90, 270, 0.5)).toBe(180)
  })
})

describe('circularInterpolateRadians', () => {
  it('should interpolate correctly for normal angles in radians', () => {
    // π/6 to π/3 (30° to 60°) - midpoint should be π/4 (45°)
    expect(
      circularInterpolateRadians(Math.PI / 6, Math.PI / 3, 0.5),
    ).toBeCloseTo(Math.PI / 4, 10)

    // 0 to π/2 (0° to 90°) - midpoint should be π/4 (45°)
    expect(circularInterpolateRadians(0, Math.PI / 2, 0.5)).toBeCloseTo(
      Math.PI / 4,
      10,
    )

    // Basic linear interpolation for small angles
    expect(circularInterpolateRadians(0.1, 0.3, 0.5)).toBeCloseTo(0.2, 10)
  })

  it('should handle crossing π boundary correctly (positive to negative)', () => {
    // From 3π/4 to -3π/4 should go the short way through π, not through 0
    // Short path: 3π/4 → π → -3π/4 (angular distance = π/2)
    const start = (3 * Math.PI) / 4 // 135°
    const end = -(3 * Math.PI) / 4 // -135°

    // Midpoint should be π (180°)
    expect(circularInterpolateRadians(start, end, 0.5)).toBeCloseTo(Math.PI, 10)

    // Quarter way should be 7π/8 (157.5°)
    expect(circularInterpolateRadians(start, end, 0.25)).toBeCloseTo(
      (7 * Math.PI) / 8,
      10,
    )

    // Three quarters should be -7π/8 (-157.5°)
    expect(circularInterpolateRadians(start, end, 0.75)).toBeCloseTo(
      -(7 * Math.PI) / 8,
      10,
    )
  })

  it('should handle crossing -π boundary correctly (negative to positive)', () => {
    // From -3π/4 to 3π/4 should go the short way through -π, not through 0
    const start = -(3 * Math.PI) / 4 // -135°
    const end = (3 * Math.PI) / 4 // 135°

    // Midpoint should be -π (-180°)
    expect(circularInterpolateRadians(start, end, 0.5)).toBeCloseTo(
      -Math.PI,
      10,
    )
  })

  it('should handle edge cases at exact boundaries', () => {
    // From π to -π (equivalent angles)
    expect(circularInterpolateRadians(Math.PI, -Math.PI, 0.5)).toBeCloseTo(
      Math.PI,
      10,
    )

    // From -π to π (equivalent angles)
    expect(circularInterpolateRadians(-Math.PI, Math.PI, 0.5)).toBeCloseTo(
      -Math.PI,
      10,
    )
  })

  it('should handle fraction values of 0 and 1', () => {
    const start = Math.PI / 4
    const end = (3 * Math.PI) / 4

    // fraction = 0 should return start value
    expect(circularInterpolateRadians(start, end, 0)).toBeCloseTo(start, 10)

    // fraction = 1 should return end value
    expect(circularInterpolateRadians(start, end, 1)).toBeCloseTo(end, 10)
  })

  it('should handle small angle differences correctly', () => {
    // Very small difference - should behave like linear interpolation
    const start = 0.1
    const end = 0.2
    expect(circularInterpolateRadians(start, end, 0.5)).toBeCloseTo(0.15, 10)
  })

  it('should handle angles near zero crossing', () => {
    // From -0.1 to 0.1 rad - should go directly, not around
    expect(circularInterpolateRadians(-0.1, 0.1, 0.5)).toBeCloseTo(0, 10)

    // From 0.1 to -0.1 rad - should go directly
    expect(circularInterpolateRadians(0.1, -0.1, 0.5)).toBeCloseTo(0, 10)
  })

  it('should handle maximum angular difference (π radians)', () => {
    // π/2 to -π/2 - exactly π radians apart
    // Could go either way, but should be consistent
    const result = circularInterpolateRadians(Math.PI / 2, -Math.PI / 2, 0.5)
    // Should be either π or -π (both equivalent)
    expect(Math.abs(Math.abs(result) - Math.PI)).toBeCloseTo(Math.PI, 10)
  })

  it('should handle typical aircraft attitude angles', () => {
    // Roll from -π/4 to π/4 (level flight oscillation)
    expect(
      circularInterpolateRadians(-Math.PI / 4, Math.PI / 4, 0.5),
    ).toBeCloseTo(0, 10)

    // Pitch from -π/6 to π/6 (climb to dive)
    expect(
      circularInterpolateRadians(-Math.PI / 6, Math.PI / 6, 0.5),
    ).toBeCloseTo(0, 10)

    // Yaw turning around - from 2.5 to -2.5 (crossing ±π)
    const yawResult = circularInterpolateRadians(2.5, -2.5, 0.5)
    // Should go the short way through π/-π
    expect(Math.abs(Math.abs(yawResult) - Math.PI)).toBeLessThan(0.1)
  })

  it('should be consistent with reverse interpolation', () => {
    const start = Math.PI / 3
    const end = (2 * Math.PI) / 3

    // Forward interpolation at 0.3
    const forward = circularInterpolateRadians(start, end, 0.3)

    // Reverse interpolation at 0.7 should give same result
    const reverse = circularInterpolateRadians(end, start, 0.7)

    expect(forward).toBeCloseTo(reverse, 10)
  })
})

describe('resampleData', () => {
  const createMockLogRecord = (
    flightTimeSec: number,
    lat: number,
    lng: number,
    altitudeM: number,
    groundSpeedKmh: number,
    headingDeg: number,
    baseDate: Date = new Date('2000-01-01T00:00:00.000Z'),
  ): LogRecord => ({
    flightTimeSec,
    coordinates: { lat, lng, alt: altitudeM },
    altitudeM,
    date: new Date(baseDate.getTime() + flightTimeSec * 1000),
    groundSpeedKmh,
    headingDeg,
    transmitterLinkQuality: 0,
    transmitterPowerMw: 0,
    amperageCurrentA: 0,
    verticalSpeedMps: 0,
    rollRad: 0,
    pitchRad: 0,
    yawRad: 0,
    recieverLinkQuality: 0,
    recieverSSIdB: 0,
    transmitterSSIdB: 0,
    flightMode: '',
    capacityMah: 0,
    batteryPercent: 0,
    recieverBatteryVolt: 0,
  })

  it('should return empty array for empty input', () => {
    const result = resampleData([], 1)
    expect(result).toEqual([])
  })

  it('should throw error if first record does not have flightTimeSec equal to 0', () => {
    const data = [createMockLogRecord(1, 41.0, 45.0, 100, 50, 180)]

    expect(() => resampleData(data, 1)).toThrow(
      'The first record must have flightTimeSec equal to 0.',
    )
  })

  it('should return original data if it has only one record', () => {
    const data = [createMockLogRecord(0, 41.0, 45.0, 100, 50, 180)]
    const result = resampleData(data, 1)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(data[0])
  })

  it('should resample data at specified frequency', () => {
    const baseDate = new Date('2000-01-01T00:00:00.000Z')
    const data = [
      createMockLogRecord(0, 41.0, 45.0, 100, 50, 180, baseDate),
      createMockLogRecord(2, 42.0, 46.0, 200, 60, 190, baseDate),
      createMockLogRecord(4, 43.0, 47.0, 300, 70, 200, baseDate),
    ]

    const result = resampleData(data, 1)

    expect(result).toHaveLength(5)

    // First record should be unchanged
    expect(result[0]).toEqual(data[0])
    // Last record should be unchanged
    expect(result[4]).toEqual(data[2])

    // Check interpolated values at t=1
    expect(result[1].flightTimeSec).toBe(1)
    expect(result[1].coordinates.lat).toBe(41.5) // Linear interpolation between 41 and 42
    expect(result[1].coordinates.lng).toBe(45.5) // Linear interpolation between 45 and 46
    expect(result[1].altitudeM).toBe(150) // Linear interpolation between 100 and 200
    expect(result[1].groundSpeedKmh).toBe(55) // Linear interpolation between 50 and 60
    expect(result[1].headingDeg).toBe(185) // Linear interpolation between 180 and 190
    expect(result[1].date).toEqual(new Date('2000-01-01T00:00:01.000Z'))

    // Check that t=2 matches original data point
    expect(result[2]).toEqual(data[1])

    // Check interpolated values at t=3
    expect(result[3].flightTimeSec).toBe(3)
    expect(result[3].coordinates.lat).toBe(42.5)
    expect(result[3].coordinates.lng).toBe(46.5)
    expect(result[3].altitudeM).toBe(250)
    expect(result[3].groundSpeedKmh).toBe(65)
    expect(result[3].headingDeg).toBe(195)

    // Check that t=4 matches original data point
    expect(result[4]).toEqual(data[2])
  })

  it('should handle fractional target frequency', () => {
    const baseDate = new Date('2000-01-01T00:00:00.000Z')
    const data = [
      createMockLogRecord(0, 41.0, 45.0, 100, 50, 180, baseDate),
      createMockLogRecord(1, 42.0, 46.0, 200, 60, 190, baseDate),
    ]

    const result = resampleData(data, 0.5)

    expect(result).toHaveLength(3) // 0, 0.5, 1.0 seconds

    // Check interpolated values at t=0.5
    expect(result[1].flightTimeSec).toBe(0.5)
    expect(result[1].coordinates.lat).toBe(41.5)
    expect(result[1].coordinates.lng).toBe(45.5)
    expect(result[1].altitudeM).toBe(150)
    expect(result[1].groundSpeedKmh).toBe(55)
    expect(result[1].headingDeg).toBe(185)
    expect(result[1].date).toEqual(new Date('2000-01-01T00:00:00.500Z'))
  })

  it('should handle uneven time intervals in source data', () => {
    const baseDate = new Date('2000-01-01T00:00:00.000Z')
    const data = [
      createMockLogRecord(0, 41.0, 45.0, 100, 50, 180, baseDate),
      createMockLogRecord(0.5, 41.25, 45.25, 125, 52.5, 182.5, baseDate),
      createMockLogRecord(3, 43.0, 47.0, 300, 70, 200, baseDate),
    ]

    const result = resampleData(data, 1)

    expect(result).toHaveLength(4) // 0, 1, 2, 3 seconds

    // t=1 should interpolate between records at t=0.5 and t=3
    expect(result[1].flightTimeSec).toBe(1)
    expect(result[1].coordinates.lat).toBeCloseTo(41.6, 5)
    expect(result[1].coordinates.lng).toBeCloseTo(45.6, 5)
    expect(result[1].altitudeM).toBeCloseTo(160, 5)
  })

  it('should stop resampling when reaching the end of data', () => {
    const baseDate = new Date('2000-01-01T00:00:00.000Z')
    const data = [
      createMockLogRecord(0, 41.0, 45.0, 100, 50, 180, baseDate),
      createMockLogRecord(10, 42.0, 46.0, 200, 60, 190, baseDate),
    ]

    const result = resampleData(data, 1)

    expect(result).toHaveLength(11) // 0, 1 seconds (stops before 2 because last record is at 1.5)
    expect(result[0]).toEqual(data[0])
    expect(result[10]).toEqual(data[1])

    expect(result[1].flightTimeSec).toBe(1)
    expect(result[1].altitudeM).toBeCloseTo(110, 5) // Interpolated value

    expect(result[9].flightTimeSec).toBe(9)
    expect(result[9].altitudeM).toBeCloseTo(190, 5) // Interpolated value
  })

  it('should handle large target frequency (larger than data duration)', () => {
    const baseDate = new Date('2000-01-01T00:00:00.000Z')
    const data = [
      createMockLogRecord(0, 41.0, 45.0, 100, 50, 180, baseDate),
      createMockLogRecord(0.5, 42.0, 46.0, 200, 60, 190, baseDate),
    ]

    const result = resampleData(data, 2)

    expect(result).toHaveLength(1) // Only the original first record
    expect(result[0]).toEqual(data[0])
  })

  it('should preserve data types and structure', () => {
    const baseDate = new Date('2000-01-01T00:09:16.080Z')
    const data = [
      createMockLogRecord(0, 41.8635, 45.279461, 0, 0.0, 0.0, baseDate),
      createMockLogRecord(1.36, 41.0, 0.279461, 3, 5.5, 15.5, baseDate),
    ]

    const result = resampleData(data, 0.5)

    expect(result).toHaveLength(3) // 0, 0.5, 1.0 seconds

    // Check that all properties exist and have correct types
    result.forEach((record) => {
      expect(typeof record.flightTimeSec).toBe('number')
      expect(typeof record.coordinates.lat).toBe('number')
      expect(typeof record.coordinates.lng).toBe('number')
      expect(typeof record.altitudeM).toBe('number')
      expect(record.date).toBeInstanceOf(Date)
      expect(typeof record.groundSpeedKmh).toBe('number')
      expect(typeof record.headingDeg).toBe('number')
    })
  })

  it('should handle edge case with exact time matches', () => {
    const baseDate = new Date('2000-01-01T00:00:00.000Z')
    const data = [
      createMockLogRecord(0, 41.0, 45.0, 100, 50, 180, baseDate),
      createMockLogRecord(1, 42.0, 46.0, 200, 60, 190, baseDate),
      createMockLogRecord(2, 43.0, 47.0, 300, 70, 200, baseDate),
    ]

    const result = resampleData(data, 1)

    expect(result).toHaveLength(3)
    // All records should match the original data exactly
    expect(result[0]).toEqual(data[0])
    expect(result[1]).toEqual(data[1])
    expect(result[2]).toEqual(data[2])
  })
})
