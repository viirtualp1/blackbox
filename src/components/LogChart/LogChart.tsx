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
  onPointHover?: (
    point: {
      index: number
      datasetIndex: number
      value: number
      label: string | number
      second: number
    } | null,
  ) => void
}

const GRAPH_MAX_POINTS = 1000

const StyledBox = styled(Box)({
  position: 'relative',
})

const LogChart: FC<Props> = ({ onSelect, onPointHover }) => {
  const { log } = useLogStore()
  const { mode } = useColorScheme()
  const theme = useTheme()

  const lineRef = useRef<any>(null)
  const { settings } = useChartSettingsStore()

  const simpleLogFields = useMemo<(keyof LogRecord)[]>(
    () => [
      'altitudeM',
      'groundSpeedKmh',
      'verticalSpeedMps',
      'amperageCurrentA',
      'transmitterLinkQuality',
      'recieverLinkQuality',
    ],
    [],
  )

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
        tension: 0.1,
      })
    }

    const dates = resampled.map((record) => record.flightTimeSec)
    return [datasets, dates, fieldColors]
  }, [log, settings, mode, simpleLogFields])

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

  const handleHover = useMemo(() => {
    if (!onPointHover || !dates) return undefined

    return (event: any, elements: any[], chart: any) => {
      // If there are elements directly under the cursor, use those
      if (elements.length > 0) {
        const { datasetIndex, index } = elements[0]
        const dataset = chart.data.datasets[datasetIndex]
        const value = dataset.data[index]
        const label = chart.data.labels[index]
        const second = dates[index]

        onPointHover({
          index,
          datasetIndex,
          value,
          label,
          second,
        })
      } else if (event.type === 'mousemove' && chart.scales.x) {
        // If no elements are hovered but mouse is over the chart, find the closest point
        const xScale = chart.scales.x
        const mouseX = event.offsetX

        // Get x-coordinate in the chart's coordinate system
        const xValue = xScale.getValueForPixel(mouseX)

        // Find closest index in the data
        if (
          typeof xValue === 'number' &&
          !isNaN(xValue) &&
          xValue >= 0 &&
          xValue < dates.length
        ) {
          // If the x value is within range, use the closest index
          const index = Math.round(xValue)

          // Use the first visible dataset for the value
          const visibleDatasets = chart.data.datasets.filter(
            (_ds: any, i: number) => chart.isDatasetVisible(i),
          )

          if (visibleDatasets.length > 0) {
            const datasetIndex = chart.data.datasets.indexOf(visibleDatasets[0])
            const dataset = chart.data.datasets[datasetIndex]
            const value = dataset.data[index]
            const label = chart.data.labels[index]
            const second = dates[index]

            onPointHover({
              index,
              datasetIndex,
              value,
              label,
              second,
            })
          }
        } else {
          // If mouse moved out of data range, clear hover
          onPointHover(null)
        }
      } else {
        // No elements hovered and not a mousemove event, clear the hover state
        onPointHover(null)
      }
    }
  }, [onPointHover, dates])

  return (
    <StyledBox>
      <Line
        ref={lineRef}
        updateMode="resize"
        style={{ maxHeight: '300px' }}
        options={{
          animation: false,
          responsive: true,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              display: false,
            },
            // @ts-ignore
            draggableSelectRange: draggableSelectRangeConfig,
            tooltip: {
              enabled: true,
              mode: 'nearest',
              intersect: false,
              axis: 'x',
            },
            // Add a custom crosshair plugin that highlights the entire vertical line
            crosshair: {
              line: {
                color: theme.palette.divider,
                width: 1,
              },
              sync: {
                enabled: true,
                group: 1,
                suppressTooltips: false,
              },
              zoom: {
                enabled: false,
              },
            },
          },
          onHover: handleHover,
          // This ensures the hover event works across the entire chart
          events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
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
