import type { Log, LogStatistics } from '@/parse/types'
import { ValueStatCalculator } from './ValueStatCalculator'
import { DistanceCalculator } from './DistanceCalculator'
import { DerivativeCalculator } from './DerivativeCalculator'

export interface CalculateStatisticOptions {
  fromSec?: number
  untilSec?: number
}

export function calculateStatistic(
  log: Log | null,
  options: CalculateStatisticOptions = {},
): LogStatistics | null {
  if (!log || !log.records || log.records.length === 0) {
    return null
  }

  const altitudeCalculator = new ValueStatCalculator()
  const speedCalculator = new ValueStatCalculator()
  const transmitterPowerCalculator = new ValueStatCalculator()
  const transmitterQualityCalculator = new ValueStatCalculator()
  const distanceCalculator = new DistanceCalculator()
  const distanceCalculatorFlat = new DistanceCalculator()
  const rollDerivativeCalculator = new DerivativeCalculator()
  const capacityDerivativeCalculator = new DerivativeCalculator()
  const fullCapacityMah = new ValueStatCalculator()
  const verticalSpeedMpsCalculator = new ValueStatCalculator()
  const amperageCurrentA = new ValueStatCalculator()
  let startCapacityMah: number | null = null
  let startSec: number | null = null
  let endSec: number | null = null
  for (let i = 0; i < log.records.length; i++) {
    const record = log.records[i]
    if (
      (options.fromSec !== undefined &&
        record.flightTimeSec < options.fromSec) ||
      (options.untilSec !== undefined &&
        record.flightTimeSec > options.untilSec)
    ) {
      continue
    }

    if (startSec === null || record.flightTimeSec < startSec) {
      startSec = record.flightTimeSec
    }

    if (endSec === null || record.flightTimeSec > endSec) {
      endSec = record.flightTimeSec
    }

    if (startCapacityMah === null) {
      startCapacityMah = record.capacityMah
    }

    const prevRecord = log.records[i - 1] || null
    const weight = prevRecord
      ? record.flightTimeSec - prevRecord.flightTimeSec
      : 1

    altitudeCalculator.addValueWeighted(record.altitudeM, weight)
    speedCalculator.addValueWeighted(record.groundSpeedKmh, weight)
    transmitterPowerCalculator.addValueWeighted(
      record.transmitterPowerMw,
      weight,
    )
    transmitterQualityCalculator.addValueWeighted(
      record.transmitterLinkQuality,
      weight,
    )
    distanceCalculator.addPoint(record.coordinates, record.altitudeM)
    rollDerivativeCalculator.addValue(record.rollRad, weight)
    fullCapacityMah.addValueWeighted(
      record.capacityMah - startCapacityMah,
      weight,
    )
    capacityDerivativeCalculator.addValue(
      record.capacityMah - startCapacityMah,
      weight,
    )
    verticalSpeedMpsCalculator.addValueWeighted(record.verticalSpeedMps, weight)
    distanceCalculatorFlat.addPoint(record.coordinates, 0)
    amperageCurrentA.addValueWeighted(record.amperageCurrentA, weight)
  }

  const alt = altitudeCalculator.getValue()
  const altitudeChangePerKm =
    (alt.lastValue - alt.firstValue) /
    (distanceCalculatorFlat.getDistance().totalDistanceM / 1000)

  return {
    altitude: altitudeCalculator.getValue(),
    verticalSpeedMps: verticalSpeedMpsCalculator.getValue(),
    groundSpeedKmh: speedCalculator.getValue(),
    transmitterPowerMw: transmitterPowerCalculator.getValue(),
    transmitterLinkQuality: transmitterQualityCalculator.getValue(),
    totalDistanceM: distanceCalculator.getDistance().totalDistanceM,
    totalDistanceFlatM: distanceCalculatorFlat.getDistance().totalDistanceM,
    fullCapacityMah: fullCapacityMah.getValue().max,
    amperageCurrentA: amperageCurrentA.getValue(),
    mahPerKm:
      fullCapacityMah.getValue().max /
      (distanceCalculator.getDistance().totalDistanceM / 1000),
    mahPerMinute: fullCapacityMah.getValue().max / (log.durationSec / 60 || 1), // avoid division by zero
    durationSec: endSec !== null && startSec !== null ? endSec - startSec : 0,
    altitudeChangePerKm,
    avgGlideSlopeDeg:
      distanceCalculatorFlat.getDistance().totalDistanceM > 0
        ? Math.atan(
            (alt.lastValue - alt.firstValue) /
              distanceCalculatorFlat.getDistance().totalDistanceM,
          ) *
          (180 / Math.PI)
        : 0,
  }
}
