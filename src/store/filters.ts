import { create } from 'zustand'
import { FiltersType, type FilterLogItem } from '@/types/filters.ts'
import type { EdgeTXLogRecord } from '@/parse/types'

export type FiltersData = Record<FiltersType, FilterLogItem<any>>

interface FiltersState {
  currentFilter: FiltersType
  filters: FiltersData
  setCurrentFilter: (filter: FiltersType) => void
  setFilter: (filter: keyof FiltersData, value: FilterLogItem<any>) => void
  setFilters: (filters: FiltersData) => void
}

export const getPureFilter = (
  key: keyof EdgeTXLogRecord,
): FilterLogItem<any> => ({
  date: '',
  time: '',
  normalizedDate: '',
  value: null,
  key,
  isMin: false,
  isMax: false,
})

export const getPureFilters = (): FiltersData => ({
  [FiltersType.ALTITUDE]: getPureFilter('Alt(m)'),
  [FiltersType.BAT]: getPureFilter('Bat%(%)'),
  [FiltersType.SPEED]: getPureFilter('GSpd(kmh)'),
})

export const useFiltersStore = create<FiltersState>((set) => ({
  currentFilter: FiltersType.ALTITUDE,
  filters: getPureFilters(),
  setCurrentFilter: (newFilter: FiltersType) =>
    set({ currentFilter: newFilter }),
  setFilters: (newFilters: FiltersData) => set({ filters: newFilters }),
  setFilter: (filter: keyof FiltersData, value: FilterLogItem<any>) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [filter]: value,
      },
    })),
}))
