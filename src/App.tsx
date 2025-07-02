import { type ChangeEvent, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import HighlightOff from '@mui/icons-material/HighlightOff'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useLogStore } from '@/store/log.ts'
import type { DraggableSelectEvent } from '@/utils/chart'
import { resampleData } from './parse/resampler/resampler'
import { parseEdgeTxLogs } from './parse/edgetx/parseEdgeTxLog'
import type { Log, LogStatistics } from './parse/types'
import { ValueStatCalculator } from './math/ValueStatCalculator'
import { DistanceCalculator } from './math/DistanceCalculator'
import { DerivativeCalculator } from './math/DerivativeCalculator'
import VisuallyHiddenInput from '@/components/ui/VisuallyHiddenInput.tsx'
import Map from '@/components/Map/Map.tsx'
import LogChart from '@/components/LogChart/LogChart.tsx'
import Stats from '@/components/Stats/Stats.tsx'

function App() {
  const [data, saveData] = useLocalStorage<string | null>('RawData2', null)
  const { setLog, rawLog, setRawLog } = useLogStore()

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

    const altitudeCalculator = new ValueStatCalculator()
    const speedCalculator = new ValueStatCalculator()
    const transmitterPowerCalculator = new ValueStatCalculator()
    const transmitterQualityCalculator = new ValueStatCalculator()
    const distanceCalculator = new DistanceCalculator()
    const rollDerivativeCalculator = new DerivativeCalculator()

    for (let i = 0; i < rawLog.records.length; i++) {
      const record = rawLog.records[i]
      const prevRecord = rawLog.records[i - 1] || null
      const weight = prevRecord
        ? record.flightTimeSec - prevRecord.flightTimeSec
        : 1

      altitudeCalculator.addValueWeighted(record.altitudeM, weight)
      speedCalculator.addValueWeighted(record.groundSpeedKmh, weight)
      transmitterPowerCalculator.addValueWeighted(
        record.transmitterPowerMw,
        weight,
      )
      transmitterQualityCalculator.addValueWeighted(
        record.transmitterLinkQuality,
        weight,
      )
      distanceCalculator.addPoint(record.coordinates, record.altitudeM)
      rollDerivativeCalculator.addValue(record.rollRad, weight)
    }

    console.log('Altitude stats:', altitudeCalculator.getValue())
    console.log('Speed stats:', speedCalculator.getValue())
    console.log(
      'Transmitter Power stats:',
      transmitterPowerCalculator.getValue(),
    )
    console.log(
      'Transmitter Quality stats:',
      transmitterQualityCalculator.getValue(),
    )
    console.log(
      'Total distance:',
      distanceCalculator.getDistance().totalDistanceM,
      'm',
    )
    console.log(
      'Roll Derivative stats:',
      rollDerivativeCalculator.getDerivativeData(),
    )

    const stats: LogStatistics = {
      altitude: altitudeCalculator.getValue(),
      groundSpeedKmh: speedCalculator.getValue(),
      transmitterPowerMw: transmitterPowerCalculator.getValue(),
      transmitterLinkQuality: transmitterQualityCalculator.getValue(),
      totalDistanceM: distanceCalculator.getDistance().totalDistanceM,
    }

    return stats
  }, [rawLog])

  const theme = useTheme()

  const styles = useMemo(
    () => ({
      container: {
        minWidth: '300px',
        [theme.breakpoints.up('md')]: {
          minWidth: '900px',
        },
        [theme.breakpoints.up('lg')]: {
          minWidth: '1200px',
        },
        [theme.breakpoints.up('xl')]: {
          minWidth: '1536px',
        },
      },
    }),
    [theme.breakpoints],
  )

  const parseRawData = async (rawData: string): Promise<Log> => {
    console.log('Parsing raw data...', rawData.length, 'characters')
    return await parseEdgeTxLogs(rawData)
  }

  const onRangeSelect = ({ range }: DraggableSelectEvent) => {
    console.log(range)
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
        <Container sx={styles.container}>
          <Grid
            container
            width="100%"
            spacing={1}
            alignItems="center"
            sx={{ mb: 2 }}
          >
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
              <Grid size={{ sm: 12, lg: 9 }}>
                <Map stat={globalLogStatistic} />
              </Grid>
              <Grid size={{ sm: 12, lg: 3 }}>
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
