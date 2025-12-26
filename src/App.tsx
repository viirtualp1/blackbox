import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useLogStore } from '@/store/log.ts'
import { resampleData } from './parse/resampler/resampler'
import { parseEdgeTxLogs } from './parse/edgetx/parseEdgeTxLog'
import type { Log } from './parse/types'
import AppThemeSelect from '@/components/AppThemeSelect/AppThemeSelect.tsx'
import LandingPage from '@/components/LandingPage/LandingPage.tsx'
import MainPage from '@/components/MainPage/MainPage.tsx'
import { compressHashData, decompressHashData } from './hash/index.ts'

function App() {
  const [data, saveData] = useLocalStorage<string | null>('RawData2', null)
  const { setLog } = useLogStore()

  const [rawLog, setRawLog] = useState<Log | null>(null)

  const darkTheme = createTheme({
    colorSchemes: {
      dark: true,
    },
  })

  useEffect(() => {
    const hashData = window.location.hash.substring(1)
    if (!hashData) {
      return
    }

    const init = async () => {
      console.log('restore data from the hash', hashData.length, 'characters')
      console.log('decompressing...')

      const decompressedHashData = await decompressHashData(hashData)
      saveData(decompressedHashData.logRaw)
    }

    init().catch((error) => {
      console.error('Error decompressing hash data:', error)
      alert('Error decompressing hash data: ' + error.message)
    })

    return () => {
      // abort the init
    }
  }, [])

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
  }, [rawLog, setLog])

  const parseRawData = async (rawData: string): Promise<Log> => {
    console.log('Parsing raw data...', rawData.length, 'characters')
    return await parseEdgeTxLogs(rawData)
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

  const onShare = async () => {
    if (!data) return

    const compressed = await compressHashData({ logRaw: data })
    const url = `${window.location.origin}${window.location.pathname}#${compressed}`

    await navigator.clipboard.writeText(url)
    alert(
      'Link copied to clipboard! It might be quite long, however, it will work anyway.',
    )
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppThemeSelect />

      {!log && (
        <LandingPage
          onUploadFile={onUploadFile}
          onInitExampleFile={initExampleFile}
        />
      )}

      {log && rawLog && (
        <MainPage
          log={log}
          rawLog={rawLog}
          onClearData={clearData}
          onShare={onShare}
        />
      )}
    </ThemeProvider>
  )
}

export default App
