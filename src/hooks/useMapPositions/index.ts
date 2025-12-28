import { useState, useCallback } from 'react'
import type { LocationData, Segment } from '@/types/data'
import type { Log, LogRecord, LogStatistics } from '@/parse/types'

interface UseMapPositionsReturn {
  /* States */
  path: LocationData[]
  centerPosition: LocationData | null
  startPosition: LocationData | null
  finishPosition: LocationData | null

  /* Methods */
  initCenterPosition: () => void
  initPath: () => void
  initStartPosition: () => void
  initFinishPosition: () => void
}

export type LineConfigHandler = (
  record: LogRecord,
  stat: LogStatistics,
) => Segment['config']

export function useMapPositions(log: Log | null): UseMapPositionsReturn {
  const [centerPosition, setCenterPosition] = useState<LocationData | null>(
    null,
  )
  const [startPosition, setStartPosition] = useState<LocationData | null>(null)
  const [finishPosition, setFinishPosition] = useState<LocationData | null>(
    null,
  )
  const [path, setPath] = useState<LocationData[]>([])

  const initCenterPosition = useCallback(() => {
    if (!log || log.records.length === 0) return

    setCenterPosition({
      lat: log.records[0].coordinates.lat,
      lng: log.records[0].coordinates.lng,
      alt: log.records[0].coordinates.alt,
    })
  }, [log])

  const initPath = useCallback(() => {
    if (!log || log.records.length === 0) return

    const newPath: LocationData[] = log.records.map(
      ({ coordinates }): LocationData => {
        return { ...coordinates }
      },
    )

    setPath(newPath)
  }, [log])

  const initStartPosition = useCallback(() => {
    if (!log) return

    setStartPosition(log.records[0].coordinates)
  }, [log])

  const initFinishPosition = useCallback(() => {
    if (!log) return

    const gps = log.records[log.records.length - 1].coordinates
    setFinishPosition({ lat: gps.lat, lng: gps.lng, alt: gps.alt })
  }, [log])

  return {
    /* States */
    path,
    centerPosition,
    startPosition,
    finishPosition,

    /* Methods */
    initCenterPosition,
    initPath,
    initStartPosition,
    initFinishPosition,
  }
}
