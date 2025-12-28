import type { EdgeTXLogRecord } from '@/parse/types'

export enum FiltersType {
  ALTITUDE,
  SPEED,
  BAT,
}

export type FilterLogItem<K extends keyof EdgeTXLogRecord> = {
  date: string
  time: string
  normalizedDate: string
  value: EdgeTXLogRecord[K]
  key: keyof EdgeTXLogRecord
  isMin: boolean
  isMax: boolean
}
