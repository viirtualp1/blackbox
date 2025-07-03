import { type FC, useMemo, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import { Box, styled } from '@mui/material'
import { useLogStore } from '@/store/log.ts'
import {
  type DraggableSelectEvent,
  getDraggableSelectRangeConfig,
} from '@/utils/chart'
import LogChartSettings from '@/components/LogChartSettings/LogChartSettings.tsx'
import { useChartSettingsStore } from '@/store/chart-settings'
import type { LogRecord } from '@/parse/types'
import { resampleData } from '@/parse/resampler/resampler'

const GRAPH_MAX_POINTS = 1000
interface Props {
  onSelect: (event: DraggableSelectEvent) => void
}

const StyledBox = styled(Box)({
  position: 'relative',
})

const LogChart: FC<Props> = ({ onSelect }) => {
  const { log } = useLogStore()

  const lineRef = useRef<any>(null)
  const { settings } = useChartSettingsStore()

  const simpleLogFields: (keyof LogRecord)[] = [
    'altitudeM',
    'groundSpeedKmh',
    'verticalSpeedMps',
    'amperageCurrentA',
    'transmitterLinkQuality',
    'recieverLinkQuality',
  ]

  const [datasets, dates, fieldColors] = useMemo(() => {
    if (!log) return []
    const resampleRate = Math.max(
      1,
      Math.round(log.durationSec / GRAPH_MAX_POINTS),
    )
    console.info(`Log: Resampling log data (rate: ${resampleRate})`)

    const resampled = resampleData(log.records, resampleRate)
    console.info(`Log: Resampled log data to ${resampled.length} points`)

    const datasets = []
    const fieldColors: Record<string, string> = {}

    const availableColors = [
      '#00ff00',
      '#ff0000',
      '#0000ff',
      '#ffff00',
      '#ff00ff',
      '#00ffff',
      '#ff8800',
    ]

    for (const field of simpleLogFields) {
      if (!settings[field]) continue

      const color = availableColors.pop()!
      fieldColors[field] = color

      const data = resampled.map((record) => Number(record[field]))
      datasets.push({
        label: field,
        data,
        pointRadius: 1,
        pointHoverRadius: 5,
        borderColor: color,
        fill: true,
        yAxisID: field,
      })
    }

    const dates = resampled.map((record) => record.flightTimeSec)
    return [datasets, dates, fieldColors]
  }, [log, settings])

  return (
    <StyledBox>
      <Line
        ref={lineRef}
        updateMode="resize"
        style={{ maxHeight: '350px' }}
        options={{
          animation: false,
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            // @ts-ignore
            draggableSelectRange: getDraggableSelectRangeConfig({
              onSelect,
            }),
          },
          scales: {
            x: {
              display: false,
            },
            ...Object.fromEntries(
              simpleLogFields
                .filter((field) => settings[field])
                .map((field, index) => [
                  field,
                  {
                    type: 'linear',
                    display: true,
                    position: index % 2 === 0 ? 'left' : 'right',
                    title: {
                      display: true,
                      text: field,
                      color: fieldColors?.[field] || '#000000',
                    },
                    ticks: {
                      color: fieldColors?.[field] || '#000000',
                    },
                    grid: {
                      drawOnChartArea: index === 0,
                    },
                  },
                ]),
            ),
          },
        }}
        data={{
          labels: dates,
          datasets: datasets!,
        }}
      />

      <LogChartSettings />
    </StyledBox>
  )
}

export default LogChart
