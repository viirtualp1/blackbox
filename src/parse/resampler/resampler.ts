import type { LogRecord } from '../types'

export function linearInterpolate(
  start: number,
  end: number,
  fraction: number,
): number {
  return start + (end - start) * fraction
}

export function circularInterpolate(
  start: number,
  end: number,
  fraction: number,
): number {
  // Handle circular interpolation for angles (0-360 degrees)
  let diff = end - start

  // Find the shortest angular distance
  if (diff > 180) {
    diff -= 360
  } else if (diff < -180) {
    diff += 360
  }

  let result = start + diff * fraction

  // Normalize to 0-360 range
  if (result < 0) {
    result += 360
  } else if (result >= 360) {
    result -= 360
  }

  return result
}

export function circularInterpolateRadians(
  start: number,
  end: number,
  fraction: number,
): number {
  // Handle circular interpolation for angles in radians (-π to π)
  let diff = end - start

  // Find the shortest angular distance
  const TWO_PI = 2 * Math.PI
  if (diff > Math.PI) {
    diff -= TWO_PI
  } else if (diff < -Math.PI) {
    diff += TWO_PI
  }

  let result = start + diff * fraction

  // Normalize to [-π, π] range
  while (result > Math.PI) {
    result -= TWO_PI
  }
  while (result <= -Math.PI) {
    result += TWO_PI
  }

  return result
}

export function resampleData(
  data: LogRecord[],
  targetFrequencySec: number,
): LogRecord[] {
  if (data.length === 0) {
    return []
  }

  if (targetFrequencySec <= 0) {
    throw new Error('Target frequency must be positive.')
  }

  if (data[0].flightTimeSec !== 0) {
    throw new Error('The first record must have flightTimeSec equal to 0.')
  }

  const totalDuration = data[data.length - 1].flightTimeSec
  const resampled: LogRecord[] = []
  resampled.push({
    ...data[0],
    $resample: {
      deviationSec: 0,
      interpolated: false,
      originalFirstRecord: data[0],
      originalSecondRecord: data[0],
      time: 0,
    },
  })

  // Use integer-based loop to avoid floating-point accumulation
  const numSteps = Math.floor(totalDuration / targetFrequencySec)

  for (let step = 1; step <= numSteps; step++) {
    const time = step * targetFrequencySec

    const secondRecordIndex = data.findIndex(
      (record) => record.flightTimeSec >= time,
    )

    if (secondRecordIndex === -1) {
      // Use the actual last data record, not the last resampled record
      const lastRecord = data[data.length - 1]
      resampled.push({
        ...lastRecord,
        flightTimeSec: time,
        date: new Date(data[0].date.getTime() + time * 1000),
        $resample: {
          deviationSec: Math.abs(time - lastRecord.flightTimeSec),
          interpolated: false,
          originalFirstRecord: lastRecord,
          originalSecondRecord: lastRecord,
          time,
        },
      })
      continue
    }

    const firstRecordIndex = secondRecordIndex - 1
    if (firstRecordIndex < 0) {
      throw new Error('Fatal: no valid first record found for interpolation.')
    }

    const secondRecord = data[secondRecordIndex]
    const firstRecord = data[firstRecordIndex]

    const minDeviationSec = Math.min(
      Math.abs(time - firstRecord.flightTimeSec),
      Math.abs(secondRecord.flightTimeSec - time),
    )

    const fraction =
      (time - firstRecord.flightTimeSec) /
      (secondRecord.flightTimeSec - firstRecord.flightTimeSec)

    const interpolatedRecord: LogRecord = {
      flightTimeSec: time,
      coordinates: {
        lat: linearInterpolate(
          firstRecord.coordinates.lat,
          secondRecord.coordinates.lat,
          fraction,
        ),
        lng: linearInterpolate(
          firstRecord.coordinates.lng,
          secondRecord.coordinates.lng,
          fraction,
        ),
        alt: linearInterpolate(
          firstRecord.coordinates.alt,
          secondRecord.coordinates.alt,
          fraction,
        ),
      },
      altitudeM: linearInterpolate(
        firstRecord.altitudeM,
        secondRecord.altitudeM,
        fraction,
      ),
      date: new Date(data[0].date.getTime() + time * 1000),
      groundSpeedKmh: linearInterpolate(
        firstRecord.groundSpeedKmh,
        secondRecord.groundSpeedKmh,
        fraction,
      ),
      headingDeg: circularInterpolate(
        firstRecord.headingDeg,
        secondRecord.headingDeg,
        fraction,
      ),
      transmitterLinkQuality: linearInterpolate(
        firstRecord.transmitterLinkQuality,
        secondRecord.transmitterLinkQuality,
        fraction,
      ),
      transmitterPowerMw: linearInterpolate(
        firstRecord.transmitterPowerMw,
        secondRecord.transmitterPowerMw,
        fraction,
      ),
      amperageCurrentA: linearInterpolate(
        firstRecord.amperageCurrentA,
        secondRecord.amperageCurrentA,
        fraction,
      ),
      verticalSpeedMps: linearInterpolate(
        firstRecord.verticalSpeedMps,
        secondRecord.verticalSpeedMps,
        fraction,
      ),
      // Fix: Use radian-specific circular interpolation
      rollRad: circularInterpolateRadians(
        firstRecord.rollRad,
        secondRecord.rollRad,
        fraction,
      ),
      pitchRad: circularInterpolateRadians(
        firstRecord.pitchRad,
        secondRecord.pitchRad,
        fraction,
      ),
      yawRad: circularInterpolateRadians(
        firstRecord.yawRad,
        secondRecord.yawRad,
        fraction,
      ),
      recieverLinkQuality: linearInterpolate(
        firstRecord.recieverLinkQuality,
        secondRecord.recieverLinkQuality,
        fraction,
      ),
      recieverSSIdB: linearInterpolate(
        firstRecord.recieverSSIdB,
        secondRecord.recieverSSIdB,
        fraction,
      ),
      transmitterSSIdB: linearInterpolate(
        firstRecord.transmitterSSIdB,
        secondRecord.transmitterSSIdB,
        fraction,
      ),
      flightMode: firstRecord.flightMode,
      capacityMah: linearInterpolate(
        firstRecord.capacityMah,
        secondRecord.capacityMah,
        fraction,
      ),
      batteryPercent: linearInterpolate(
        firstRecord.batteryPercent,
        secondRecord.batteryPercent,
        fraction,
      ),
      recieverBatteryVolt: linearInterpolate(
        firstRecord.recieverBatteryVolt,
        secondRecord.recieverBatteryVolt,
        fraction,
      ),
      $resample: {
        deviationSec: minDeviationSec,
        interpolated: true,
        originalFirstRecord: firstRecord,
        originalSecondRecord: secondRecord,
        time,
      },
    }

    resampled.push(interpolatedRecord)
  }

  return resampled
}
