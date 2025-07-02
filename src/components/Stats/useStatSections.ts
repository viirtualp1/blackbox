import HeightIcon from '@mui/icons-material/Height'
import PowerIcon from '@mui/icons-material/Power'
import FlightIcon from '@mui/icons-material/Flight'
import type { LogStatistics } from '@/parse/types'
import type { StatSection } from './types'
import { formatDuration, formatDistance } from './utils'

export const useStatSections = (stat: LogStatistics): StatSection[] => {
  return [
    {
      title: 'Flight Overview',
      icon: FlightIcon,
      type: 'valueOnly',
      data: [
        {
          metric: 'Total Distance',
          value: formatDistance(stat.totalDistanceM),
        },
        {
          metric: 'Total Distance (Flat)',
          value: formatDistance(stat.totalDistanceFlatM),
        },
        {
          metric: 'Duration',
          value: formatDuration(stat.durationSec),
        },
      ],
    },
    {
      title: 'Flight Dynamics',
      icon: HeightIcon,
      type: 'minMaxAvg',
      data: [
        {
          metric: 'Altitude (m)',
          avg: stat.altitude.average.toFixed(1),
          min: stat.altitude.min.toFixed(1),
          max: stat.altitude.max.toFixed(1),
        },
        {
          metric: 'Vertical Speed (m/s)',
          avg: stat.verticalSpeedMps.average.toFixed(2),
          min: stat.verticalSpeedMps.min.toFixed(2),
          max: stat.verticalSpeedMps.max.toFixed(2),
        },
        {
          metric: 'Ground Speed (km/h)',
          avg: stat.groundSpeedKmh.average.toFixed(1),
          min: stat.groundSpeedKmh.min.toFixed(1),
          max: stat.groundSpeedKmh.max.toFixed(1),
        },
        {
          metric: 'Current (A)',
          avg: stat.amperageCurrentA.average.toFixed(2),
          min: stat.amperageCurrentA.min.toFixed(2),
          max: stat.amperageCurrentA.max.toFixed(2),
        },
        {
          metric: 'Transmitter Power (mW)',
          avg: stat.transmitterPowerMw.average.toFixed(0),
          min: stat.transmitterPowerMw.min.toFixed(0),
          max: stat.transmitterPowerMw.max.toFixed(0),
        },
        {
          metric: 'Transmitter Link Quality (%)',
          avg: stat.transmitterLinkQuality.average.toFixed(1),
          min: stat.transmitterLinkQuality.min.toFixed(1),
          max: stat.transmitterLinkQuality.max.toFixed(1),
        },
      ],
    },
    {
      title: 'Power & Efficiency',
      icon: PowerIcon,
      type: 'valueOnly',
      data: [
        {
          metric: 'Full Capacity',
          value: `${stat.fullCapacityMah.toFixed(0)} mAh`,
        },
        {
          metric: 'mAh per Minute',
          value: `${stat.mahPerMinute.toFixed(1)} mAh/min`,
        },
        {
          metric: 'mAh per km',
          value: `${stat.mahPerKm.toFixed(1)} mAh/km`,
        },
        {
          metric: 'Altitude Change per km',
          value: `${stat.altitudeChangePerKm.toFixed(1)} m/km`,
        },
        {
          value: `${stat.avgGlideSlopeDeg.toFixed(2)}°`,
          metric: 'Average Glide Slope',
        },
      ],
    },
  ]
}
