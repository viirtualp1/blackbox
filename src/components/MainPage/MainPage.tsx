import { useCallback, useMemo, useState } from 'react'
import { interpolateHsl } from 'd3-interpolate'
import { Box, Typography, IconButton, styled } from '@mui/material'
import HighlightOff from '@mui/icons-material/HighlightOff'
import type { Segment } from '@/types/data'
import type { GetSegmentConfigOptions } from '@/components/MapPolylines/MapLogPathRenderer'
import type { DraggableSelectEvent } from '@/types/draggable-chart.ts'
import { calculateStatistic } from '@/math/calculateStatistic'
import type { Log, LogRecord, LogStatistics } from '@/parse/types'
import Map from '@/components/Map/Map.tsx'
import LogChart from '@/components/LogChart/LogChart.tsx'
import Stats from '@/components/Stats/Stats.tsx'
import { Share } from '@mui/icons-material'
import { isValueStat } from '@/math/ValueStatCalculator'

const PageContainer = styled(Box)({
  position: 'fixed',
  inset: 0,
  overflow: 'hidden',
})

const MapBackground = styled(Box)({
  position: 'absolute',
  inset: 0,
  zIndex: 0,
})

const Header = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(0, 0, 0, 0.7)'
      : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(8px)',
  padding: '8px 16px',
  borderRadius: 8,
  boxShadow: theme.shadows[4],
}))

const StatsPanel = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ theme, expanded }) => ({
  position: 'absolute',
  top: 80,
  left: 16,
  bottom: 220,
  width: expanded ? 400 : 270,
  zIndex: 10,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(0, 0, 0, 0.7)'
      : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(8px)',
  borderRadius: 12,
  boxShadow: theme.shadows[8],
  overflowY: 'auto',
  padding: 16,
  transition: 'width 0.3s ease',
}))

const ChartPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 200,
  zIndex: 10,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(0, 0, 0, 0.8)'
      : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  boxShadow: theme.shadows[16],
  padding: '12px 16px',
}))

interface MainPageProps {
  log: Log
  rawLog: Log
  onClearData: () => void
  onShare: () => void
}

function MainPage({ log, rawLog, onClearData, onShare }: MainPageProps) {
  const [selectedRange, setSelectedRange] = useState<[number, number] | null>(
    null,
  )
  const [hoveredPoint, setHoveredPoint] = useState<{ second: number } | null>(
    null,
  )
  const [statsExpanded, setStatsExpanded] = useState(false)

  const globalLogStatistic = useMemo<LogStatistics | null>(() => {
    if (!rawLog) {
      return null
    }

    const stats = calculateStatistic(rawLog)!

    console.log('Altitude stats:', stats?.altitudeM)
    console.log('Speed stats:', stats?.groundSpeedKmh)

    return stats
  }, [rawLog])

  const selectedRangeStatistic = useMemo<LogStatistics | null>(() => {
    if (!rawLog || !selectedRange) {
      return null
    }

    const [start, end] = selectedRange
    const stats = calculateStatistic(rawLog, {
      fromSec: start,
      untilSec: end,
    })!
    console.log('Selected range stats:', stats)

    return stats
  }, [rawLog, selectedRange])

  const onRangeSelect = useCallback(
    ({ range }: DraggableSelectEvent) => {
      if (range[0] === range[1]) {
        setSelectedRange(null)
        return
      }

      setSelectedRange(range)
    },
    [setSelectedRange],
  )

  const onPointHover = useCallback(
    (
      point: {
        index: number
        datasetIndex: number
        value: number
        label: string | number
        second: number
      } | null,
    ) => {
      // prevent setting the same point twice
      if (point?.second === hoveredPoint?.second) {
        return
      }

      setHoveredPoint(point)
    },
    [hoveredPoint, setHoveredPoint],
  )

  const lchCb = useCallback(
    (opts: GetSegmentConfigOptions): Segment['config'] => {
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

      const avgSegment =
        opts.usedRecords.reduce((acc: number, record: LogRecord) => {
          return record[opts.selectedField] + acc
        }, 0) / opts.usedRecords.length

      let color = '#00f'
      const globalLogStatisticField =
        globalLogStatistic[opts.selectedField as keyof LogStatistics]
      if (isValueStat(globalLogStatisticField)) {
        const max = globalLogStatisticField.max
        const min = globalLogStatisticField.min
        const size = max - min
        const perc = (avgSegment - min) / size

        color = interpolateHsl('green', 'red')(perc)
      }

      return {
        opacity: 1,
        color,
        weight: 5,
      }
    },
    [globalLogStatistic, selectedRange],
  )

  if (!globalLogStatistic) {
    return null
  }

  return (
    <PageContainer>
      <MapBackground>
        <Map
          segmentDataCallback={lchCb}
          hoveredPoint={hoveredPoint}
          fullscreen
        />
      </MapBackground>

      <Header>
        <Typography fontSize={20} fontWeight={500}>
          {log.title || 'Unknown Log'}
        </Typography>
        <IconButton
          aria-label="share"
          color="primary"
          size="small"
          onClick={onShare}
        >
          <Share />
        </IconButton>
        <IconButton
          aria-label="clear"
          color="error"
          size="small"
          onClick={onClearData}
        >
          <HighlightOff />
        </IconButton>
      </Header>

      <StatsPanel expanded={statsExpanded}>
        <Stats
          stat={selectedRangeStatistic || globalLogStatistic}
          onExpandedChange={setStatsExpanded}
        />
      </StatsPanel>

      <ChartPanel>
        <LogChart onSelect={onRangeSelect} onPointHover={onPointHover} />
      </ChartPanel>
    </PageContainer>
  )
}

export default MainPage
