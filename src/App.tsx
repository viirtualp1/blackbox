import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { interpolateHsl } from 'd3-interpolate'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Box, Button, Typography, Grid, IconButton } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import HighlightOff from '@mui/icons-material/HighlightOff'
import { useLocalStorage } from '@uidotdev/usehooks'
import type { Segment } from './types/data'
import type { GetSegmentConfigOptions } from './components/MapPolylines/MapLogPathRenderer'
import { useLogStore } from '@/store/log.ts'
import type { DraggableSelectEvent } from '@/types/draggable-chart.ts'
import { calculateStatistic } from './math/calculateStatistic'
import { resampleData } from './parse/resampler/resampler'
import { parseEdgeTxLogs } from './parse/edgetx/parseEdgeTxLog'
import type { Log, LogRecord, LogStatistics } from './parse/types'
import VisuallyHiddenInput from '@/components/ui/VisuallyHiddenInput.tsx'
import Map from '@/components/Map/Map.tsx'
import LogChart from '@/components/LogChart/LogChart.tsx'
import Stats from '@/components/Stats/Stats.tsx'
import AppThemeSelect from '@/components/AppThemeSelect/AppThemeSelect.tsx'

const styles = {
  initialContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}

function App() {
  const [data, saveData] = useLocalStorage<string | null>('RawData2', null)
  const { setLog } = useLogStore()

  const [rawLog, setRawLog] = useState<Log | null>(null)
  const [selectedRange, setSelectedRange] = useState<[number, number] | null>(
    null,
  )

  const darkTheme = createTheme({
    colorSchemes: {
      dark: true,
    },
  })

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

  const initExampleFile = async () => {
    const csvText = await import(`/public/example.csv?raw`).then(
      (m) => m.default,
    )
    saveData(csvText)
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
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppThemeSelect />

      {!log && (
        <Box sx={styles.initialContainer}>
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
          <Button sx={{ marginTop: 1 }} size="small" onClick={initExampleFile}>
            Use example file
          </Button>
        </Box>
      )}

      {log && globalLogStatistic && (
        <Box sx={{ margin: '24px' }}>
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
          <Grid width="100%" spacing={5}>
            <Grid container sx={{ mt: 1 }} spacing={2}>
              <Grid size={{ sm: 12, lg: 9 }}>
                <Map segmentDataCallback={lchCb} />
              </Grid>
              <Grid size={{ sm: 12, lg: 3 }}>
                <Stats stat={selectedRangeStatistic || globalLogStatistic} />
              </Grid>
            </Grid>
            <Grid sx={{ mt: 3 }}>
              <LogChart onSelect={onRangeSelect} />
            </Grid>
          </Grid>
        </Box>
      )}
    </ThemeProvider>
  )
}

export default App
