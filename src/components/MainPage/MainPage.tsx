import { useCallback, useMemo, useState } from 'react'
import { Box, Typography, IconButton, styled } from '@mui/material'
import HighlightOff from '@mui/icons-material/HighlightOff'
import type { DraggableSelectEvent } from '@/types/draggable-chart.ts'
import { calculateStatistic } from '@/math/calculateStatistic'
import type { Log, LogStatistics } from '@/parse/types'
import Map from '@/components/Map/Map.tsx'
import LogChart from '@/components/LogChart/LogChart.tsx'
import Stats from '@/components/Stats/Stats.tsx'
import { Share } from '@mui/icons-material'
import { createSegmentConfigCallback } from './getSegmentConfig'

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

  const segmentConfigCallback = useMemo(
    () =>
      createSegmentConfigCallback({
        selectedRange,
        globalLogStatistic,
      }),
    [globalLogStatistic, selectedRange],
  )

  if (!globalLogStatistic) {
    return null
  }

  return (
    <PageContainer>
      <MapBackground>
        <Map
          segmentDataCallback={segmentConfigCallback}
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
