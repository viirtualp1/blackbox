import { type FC, useMemo, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import { Box, styled, useTheme } from '@mui/material'
import { useColorScheme } from '@mui/material/styles'
import { useLogStore } from '@/store/log.ts'
import { useChartSettingsStore } from '@/store/chart-settings'
import type { LogRecord } from '@/parse/types'
import { darken, lighten } from '@/utils/color'
import { resampleData } from '@/parse/resampler/resampler'
import type { DraggableSelectEvent } from '@/types/draggable-chart.ts'
import LogChartSettings from '@/components/LogChartSettings/LogChartSettings.tsx'

interface Props {
  onSelect: (event: DraggableSelectEvent) => void
}

const GRAPH_MAX_POINTS = 1000

const StyledBox = styled(Box)({
  position: 'relative',
})

const LogChart: FC<Props> = ({ onSelect }) => {
  const { log } = useLogStore()
  const { mode } = useColorScheme()
  const theme = useTheme()

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
      const fillColor =
        mode === 'dark' ? lighten(color, 50, 0.1) : darken(color, 1, 0.1)

      fieldColors[field] = color

      const data = resampled.map((record) => Number(record[field]))
      datasets.push({
        label: field,
        data,
        pointRadius: 1,
        pointHoverRadius: 5,
        borderColor: color,
        fill: {
          target: 'origin',
          above: fillColor,
          below: fillColor,
        },
        yAxisID: field,
      })
    }

    const dates = resampled.map((record) => record.flightTimeSec)
    return [datasets, dates, fieldColors]
  }, [log, settings])

  const draggableSelectRangeConfig = useMemo(() => {
    return {
      enable: true,
      unselectColor: 'rgba(255,255,255,0.65)',
      borderColor: '#2388FF',
      borderWidth: 2,
      text: {
        enable: true,
        color: theme.palette.text.primary,
        font: {
          family: 'Roboto, sans-serif',
          size: 14,
        },
      },
      onSelect,
    }
  }, [onSelect, theme.palette.text.primary])

  return (
    <StyledBox>
      <Line
        ref={lineRef}
        updateMode="resize"
        style={{ maxHeight: '300px' }}
        options={{
          animation: false,
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            // @ts-ignore
            draggableSelectRange: draggableSelectRangeConfig,
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
                      color: theme.palette.divider,
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
