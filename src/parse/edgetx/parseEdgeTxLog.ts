import { safeParseNumber } from '@/utils'
import { parseCsv } from '../parceCsv'
import type { Log, LogRecord, RadiomasterLogRecord } from '../types'

export async function parseEdgeTxLogs(text: string): Promise<Log> {
  const data = (await parseCsv(text)) as RadiomasterLogRecord[]
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No valid records found in the log.')
  }

  let startDate: Date | null = null
  let endDate: Date | null = null

  const records = data.map((record): LogRecord => {
    const parsedDate = new Date(`${record.Date}T${record.Time}Z`)
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date format: ${record.Date} ${record.Time}`)
    }

    if (!startDate) {
      startDate = parsedDate
    }

    if (!endDate || parsedDate > endDate) {
      endDate = parsedDate
    }

    const [lat, lng] = record.GPS.split(' ').map(safeParseNumber)
    const coordinates = { lat, lng, alt: safeParseNumber(record['Alt(m)']) }

    const antennaIndex = Number(record['ANT']) || 0
    const data: LogRecord = {
      flightTimeSec: (parsedDate.getTime() - startDate.getTime()) / 1000,
      coordinates,
      altitudeM: safeParseNumber(record['Alt(m)']),
      date: parsedDate,
      groundSpeedKmh: safeParseNumber(record['GSpd(kmh)']),
      headingDeg: safeParseNumber(record['Hdg(°)']),
      transmitterLinkQuality: safeParseNumber(record['TQly(%)']),
      transmitterPowerMw: safeParseNumber(record['TPWR(mW)']),
      amperageCurrentA: safeParseNumber(record['Curr(A)']),
      verticalSpeedMps: safeParseNumber(record['VSpd(m/s)']),
      rollRad: safeParseNumber(record['Roll(rad)']),
      pitchRad: safeParseNumber(record['Ptch(rad)']),
      yawRad: safeParseNumber(record['Yaw(rad)']),
      recieverLinkQuality: safeParseNumber(record['RQly(%)']),
      recieverSSIdB: safeParseNumber(
        antennaIndex === 0 ? record['1RSS(dB)'] : record['2RSS(dB)'],
      ),
      transmitterSSIdB: safeParseNumber(record['TRSS(dB)']),
      flightMode: record.FM,
      batteryPercent: safeParseNumber(record['Bat%(%)']),
      recieverBatteryVolt: safeParseNumber(record['RxBt(V)']),
      capacityMah: safeParseNumber(record['Capa(mAh)']),
    }

    return data
  })

  const durationSec = (endDate!.getTime() - startDate!.getTime()) / 1000

  return {
    records,
    startDate: startDate!,
    endDate: endDate!,
    durationSec,
    title: `EdgeTX Log from ${startDate!.toLocaleString()}`,
  }
}
