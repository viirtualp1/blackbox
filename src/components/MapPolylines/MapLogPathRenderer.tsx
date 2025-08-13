import { useMemo, type FC } from 'react'
import { type PathOptions } from 'leaflet'
import { Polyline, Popup } from 'react-leaflet'
import type { LocationData, Segment } from '@/types/data'
import { getDistanceBetweenPoints } from '@/utils'
import { useLogStore } from '@/store/log.ts'
import type { Log, LogRecord } from '@/parse/types'

// Types
export interface GetSegmentConfigOptions {
  log: Log
  usedRecords: LogRecord[]
  fromSec: number
  toSec: number
}

export type GetSegmentConfig = (
  options: GetSegmentConfigOptions,
) => Segment['config']

interface PathArrowSegment {
  points: LocationData[]
  config: Segment['config']
}

interface Props {
  getConfig: GetSegmentConfig
}

// Constants
const DEFAULT_PATH_OPTIONS: PathOptions = {
  color: '#00f',
  weight: 4,
  opacity: 1,
  stroke: true,
  lineJoin: 'round',
  lineCap: 'round',
}

const MAX_SEGMENT_DISTANCE_M = 100

const MapLogPathRenderer: FC<Props> = ({ getConfig }) => {
  const { log } = useLogStore()

  const segments = useMemo(() => {
    if (!log?.records?.length) return []

    const res: PathArrowSegment[] = []
    let points: LocationData[] = []
    let segmentDistance = 0

    const flush = (used: LogRecord[]) => {
      if (!points.length) return
      res.push({
        points,
        config: getConfig({
          log,
          usedRecords: used,
          fromSec: used[0].flightTimeSec,
          toSec: used[used.length - 1].flightTimeSec,
        }),
      })
      points = []
      segmentDistance = 0
    }

    let used: LogRecord[] = []

    for (let i = 0; i < log.records.length; i++) {
      const rec = log.records[i]
      const prev = log.records[i - 1]

      points.push(rec.coordinates)
      used.push(rec)

      if (prev) {
        const d = getDistanceBetweenPoints(prev.coordinates, rec.coordinates)
        segmentDistance += d
      }

      if (segmentDistance >= MAX_SEGMENT_DISTANCE_M) {
        flush(used)
        // начинаем новую выборку с ТЕКУЩЕЙ записи,
        // не трогаем i — счётчик продолжит движение вперёд
        points.push(rec.coordinates)
        used = [rec]
      }
    }

    flush(used)
    return res
  }, [log, getConfig])

  const segmentsReversersed = useMemo(() => {
    return [...segments].reverse()
  }, [segments])

  return (
    <>
      {segmentsReversersed.map((segment, index) => (
        <div key={index}>
          <Polyline
            positions={segment.points}
            pathOptions={{
              ...DEFAULT_PATH_OPTIONS,
              opacity:
                (segment.config.opacity ?? DEFAULT_PATH_OPTIONS.opacity!) * 0.7,
              color: 'black',
              weight:
                (segment.config.weight ?? DEFAULT_PATH_OPTIONS.weight!) + 4,
            }}
          >
            {segment.config.popoverText && (
              <Popup>
                <div>{segment.config.popoverText}</div>
              </Popup>
            )}
          </Polyline>

          <Polyline
            positions={segment.points}
            pathOptions={{
              ...DEFAULT_PATH_OPTIONS,
              opacity: segment.config.opacity ?? DEFAULT_PATH_OPTIONS.opacity!,
              color: segment.config.color ?? DEFAULT_PATH_OPTIONS.color,
              weight: segment.config.weight ?? DEFAULT_PATH_OPTIONS.weight,
            }}
          >
            {segment.config.popoverText && (
              <Popup>
                <div>{segment.config.popoverText}</div>
              </Popup>
            )}
          </Polyline>
        </div>
      ))}
    </>
  )
}

export default MapLogPathRenderer
