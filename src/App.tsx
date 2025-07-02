import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Box, Button, Typography } from '@mui/material'
import { Container, Grid, IconButton } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import HighlightOff from '@mui/icons-material/HighlightOff'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useLogStore } from '@/store/log.ts'
import type { DraggableSelectEvent } from '@/utils/chart'
import { resampleData } from './parse/resampler/resampler'
import { parseEdgeTxLogs } from './parse/edgetx/parseEdgeTxLog'
import type { Log, LogRecord, LogStatistics } from './parse/types'
import VisuallyHiddenInput from '@/components/ui/VisuallyHiddenInput.tsx'
import Map from '@/components/Map/Map.tsx'
import LogChart from '@/components/LogChart/LogChart.tsx'
import Stats from '@/components/Stats/Stats.tsx'
import { calculateStatistic } from './math/calculateStatistic'
import { interpolateHsl } from 'd3-interpolate'
import type { GetSegmentConfigOptions } from './components/MapPolylines/MapLogPathRenderer'
import type { Segment } from './types/data'

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
        <Container maxWidth="xl">
          <Grid container spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Grid>
              <Typography fontSize={24}>
                {log.title || 'Unknown Log'}
              </Typography>
            </Grid>
            <Grid>
              <IconButton
                aria-label="clear"
                color="error"
                size="small"
                onClick={clearData}
              >
                <HighlightOff />
              </IconButton>
            </Grid>
          </Grid>
          <Grid spacing={3}>
            <Grid sx={{ mt: 1 }}>
              <Grid container minHeight={500} spacing={1}>
                <Map segmentDataCallback={lchCb} />
                <Stats stat={globalLogStatistic} />
              </Grid>
            </Grid>
            <Grid sx={{ mt: 3 }}>
              <LogChart onSelect={onRangeSelect} />
            </Grid>
          </Grid>
        </Container>
      )}
    </>
  )
}

export default App
