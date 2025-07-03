import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { interpolateHsl } from 'd3-interpolate'
import { Box, Button, Typography, Grid, IconButton } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import HighlightOff from '@mui/icons-material/HighlightOff'
import { useLocalStorage } from '@uidotdev/usehooks'
import type { Segment } from './types/data'
import type { GetSegmentConfigOptions } from './components/MapPolylines/MapLogPathRenderer'
import { useLogStore } from '@/store/log.ts'
import type { DraggableSelectEvent } from '@/utils/chart'
import { calculateStatistic } from './math/calculateStatistic'
import { resampleData } from './parse/resampler/resampler'
import { parseEdgeTxLogs } from './parse/edgetx/parseEdgeTxLog'
import type { Log, LogRecord, LogStatistics } from './parse/types'
import VisuallyHiddenInput from '@/components/ui/VisuallyHiddenInput.tsx'
import Map from '@/components/Map/Map.tsx'
import LogChart from '@/components/LogChart/LogChart.tsx'
import Stats from '@/components/Stats/Stats.tsx'

function App() {
  const [data, saveData] = useLocalStorage<string | null>('RawData2', null)
  const { setLog } = useLogStore()

  const [rawLog, setRawLog] = useState<Log | null>(null)
  const [selectedRange, setSelectedRange] = useState<[number, number] | null>(
    null,
  )

  useEffect(() => {
    if (!data) {
      setRawLog(null)
      return
    }
    let ignore = false

    parseRawData(data)
      .catch((error) => {
        alert('Error parsing log: ' + error.message)
        console.error('Error parsing log:', error)
        return null
      })
      .then((parsed) => {
        if (ignore) return
        setRawLog(parsed)
      })

    return () => {
      ignore = true
    }
  }, [data])

  const log = useMemo(() => {
    if (!rawLog) {
      return null
    }

    const logData: Log = {
      ...rawLog,
    }
    logData.records = resampleData(rawLog.records, 0.5)
    setLog(logData)

    return logData
  }, [rawLog])

  const globalLogStatistic = useMemo<LogStatistics | null>(() => {
    if (!rawLog) {
      return null
    }

    const stats = calculateStatistic(rawLog)!

    console.log('Altitude stats:', stats?.altitude)
    console.log('Speed stats:', stats?.groundSpeedKmh)

    return stats
  }, [rawLog])

  useMemo<LogStatistics | null>(() => {
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

  const parseRawData = async (rawData: string): Promise<Log> => {
    console.log('Parsing raw data...', rawData.length, 'characters')
    return await parseEdgeTxLogs(rawData)
  }

  const onRangeSelect = ({ range }: DraggableSelectEvent) => {
    if (range[0] === range[1]) {
      setSelectedRange(null)
      return
    }

    setSelectedRange(range)
  }

  const onUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    saveData(text)
  }

  const clearData = () => {
    saveData(null)
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

  return (
    <>
      {!log && (
        <Box>
          <h1>Blackbox</h1>

          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            size="large"
            startIcon={<CloudUploadIcon />}
          >
            Import .CSV file
            <VisuallyHiddenInput
              type="file"
              onChange={onUploadFile}
              accept=".csv"
            />
          </Button>
        </Box>
      )}

      {log && globalLogStatistic && (
        <Box sx={{ margin: '0 48px' }}>
          <Grid container spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Typography fontSize={24}>{log.title || 'Unknown Log'}</Typography>
            <IconButton
              aria-label="clear"
              color="error"
              size="small"
              onClick={clearData}
            >
              <HighlightOff />
            </IconButton>
          </Grid>
          <Grid width="100%" spacing={3}>
            <Grid container sx={{ mt: 1 }} spacing={1}>
              <Grid size={{ sm: 12, lg: 9, xl: 10 }}>
                <Map segmentDataCallback={lchCb} />
              </Grid>
              <Grid size={{ sm: 12, lg: 3, xl: 2 }}>
                <Stats stat={globalLogStatistic} />
              </Grid>
            </Grid>
            <Grid sx={{ mt: 3 }}>
              <LogChart onSelect={onRangeSelect} />
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  )
}

export default App
