import { useCallback, useMemo, useState } from 'react'
import { interpolateHsl } from 'd3-interpolate'
import { Box, Typography, Grid, IconButton } from '@mui/material'
import HighlightOff from '@mui/icons-material/HighlightOff'
import type { Segment } from '@/types/data'
import type { GetSegmentConfigOptions } from '@/components/MapPolylines/MapLogPathRenderer'
import type { DraggableSelectEvent } from '@/types/draggable-chart.ts'
import { calculateStatistic } from '@/math/calculateStatistic'
import type { Log, LogRecord, LogStatistics } from '@/parse/types'
import Map from '@/components/Map/Map.tsx'
import LogChart from '@/components/LogChart/LogChart.tsx'
import Stats from '@/components/Stats/Stats.tsx'
import MainPageSEO from '@/components/SEO/MainPageSEO'

interface MainPageProps {
  log: Log
  rawLog: Log
  onClearData: () => void
}

function MainPage({ log, rawLog, onClearData }: MainPageProps) {
  const [selectedRange, setSelectedRange] = useState<[number, number] | null>(
    null,
  )
  const [hoveredPoint, setHoveredPoint] = useState<{ second: number } | null>(
    null,
  )

  const globalLogStatistic = useMemo<LogStatistics | null>(() => {
    if (!rawLog) {
      return null
    }

    const stats = calculateStatistic(rawLog)!

    console.log('Altitude stats:', stats?.altitude)
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

  const onRangeSelect = ({ range }: DraggableSelectEvent) => {
    if (range[0] === range[1]) {
      setSelectedRange(null)
      return
    }

    setSelectedRange(range)
  }

  const lchCb = useCallback(
    (opts: GetSegmentConfigOptions): Segment['config'] => {
      if (selectedRange) {
        const [start, end] = selectedRange
        const isStartWithinRange = opts.fromSec >= start && opts.toSec <= end
        const isEndWithinRange = opts.fromSec <= end && opts.toSec >= start

        if (!isStartWithinRange && !isEndWithinRange) {
          return {
            opacity: 0.8,
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
          return record.altitudeM + acc
        }, 0) / opts.usedRecords.length
      const color = interpolateHsl(
        'green',
        'red',
      )(avgSegment / globalLogStatistic.altitude.max)
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
    <>
      <MainPageSEO />
      <Box sx={{ margin: '24px' }}>
        <Grid container spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Typography fontSize={24}>{log.title || 'Unknown Log'}</Typography>
          <IconButton
            aria-label="clear"
            color="error"
            size="small"
            onClick={onClearData}
          >
            <HighlightOff />
          </IconButton>
        </Grid>
        <Grid width="100%" spacing={5}>
          <Grid container sx={{ mt: 1 }} spacing={2}>
            <Grid size={{ sm: 12, lg: 9 }}>
              <Map segmentDataCallback={lchCb} hoveredPoint={hoveredPoint} />
            </Grid>
            <Grid size={{ sm: 12, lg: 3 }}>
              <Stats stat={selectedRangeStatistic || globalLogStatistic} />
            </Grid>
          </Grid>
          <Grid sx={{ mt: 3 }}>
            <LogChart onSelect={onRangeSelect} onPointHover={setHoveredPoint} />
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default MainPage
