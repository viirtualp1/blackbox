import { interpolateHsl } from 'd3-interpolate'
import type { Segment } from '@/types/data'
import type { GetSegmentConfigOptions } from '@/components/MapPolylines/MapLogPathRenderer'
import type { LogRecord, LogStatistics } from '@/parse/types'
import { isValueStat, type ValueStat } from '@/math/ValueStatCalculator'

interface GetSegmentConfigParams {
  selectedRange: [number, number] | null
  globalLogStatistic: LogStatistics | null
}

const calculateSegmentValue = (
  records: LogRecord[],
  field: keyof LogRecord,
) => {
  switch (field) {
    case 'recieverLinkQuality':
    case 'transmitterLinkQuality':
      return Math.min(...records.map((record: LogRecord) => record[field]))
    default:
      return (
        records.reduce((acc: number, record: LogRecord) => {
          if (typeof record[field] !== 'number') {
            return acc
          }

          return record[field] + acc
        }, 0) / records.length
      )
  }
}

const calculateSegmentPercentage = (
  field: keyof LogRecord,
  segValue: number,
  stat: ValueStat,
) => {
  const max = stat.max
  const min = stat.min
  const size = max - min

  switch (field) {
    case 'recieverLinkQuality':
    case 'transmitterLinkQuality':
      return 1 - (segValue - min) / size
    default:
      return (segValue - min) / size
  }
}

export function createSegmentConfigCallback({
  selectedRange,
  globalLogStatistic,
}: GetSegmentConfigParams) {
  return (opts: GetSegmentConfigOptions): Segment['config'] => {
    if (selectedRange) {
      const [start, end] = selectedRange
      const isStartWithinRange = opts.fromSec >= start && opts.toSec <= end
      const isEndWithinRange = opts.fromSec <= end && opts.toSec >= start

      if (!isStartWithinRange && !isEndWithinRange) {
        return {
          opacity: 0.5,
          color: 'gray',
          weight: 1,
        }
      }
    }
    if (!globalLogStatistic) {
      return {
        opacity: 0.8,
        color: 'gray',
        weight: 1,
      }
    }

    const segValue = calculateSegmentValue(opts.usedRecords, opts.selectedField)

    let color = '#00f'
    const globalLogStatisticField =
      globalLogStatistic[opts.selectedField as keyof LogStatistics]
    if (isValueStat(globalLogStatisticField)) {
      const perc = calculateSegmentPercentage(
        opts.selectedField,
        segValue,
        globalLogStatisticField,
      )
      color = interpolateHsl('green', 'red')(perc)
    }

    return {
      opacity: 1,
      color,
      weight: 5,
    }
  }
}
