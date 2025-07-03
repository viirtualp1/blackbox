import type { ChartSettings } from '@/store/chart-settings.ts'

export const getDefaultChartSettings = (): ChartSettings => ({
  altitudeM: true,
  groundSpeedKmh: false,
})
