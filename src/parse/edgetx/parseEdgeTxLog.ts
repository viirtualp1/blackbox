import { safeParseNumber } from '@/utils'
import { parseCsv } from '../parceCsv'
import type { Log, LogRecord, EdgeTXLogRecord } from '../types'

export function applyHdgNameFix(record: EdgeTXLogRecord): EdgeTXLogRecord {
  if ('Hdg(@)' in record) {
    // @ts-expect-error - we are fixing the record in place
    record['Hdg(°)'] = record['Hdg(@)']
    delete record['Hdg(@)']
  }

  return record
}

export async function parseEdgeTxLogs(text: string): Promise<Log> {
  const rawData = (await parseCsv(text)) as EdgeTXLogRecord[]
  if (!Array.isArray(rawData) || rawData.length === 0) {
    throw new Error('No valid records found in the log.')
  }

  const data = rawData.map(applyHdgNameFix)

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

    const [lat, lng] = record.GPS.split(' ').map((value, idx) =>
      safeParseNumber(value, { fieldName: `GPS ${idx === 0 ? 'lat' : 'lng'}` }),
    )
    const coordinates = {
      lat,
      lng,
      alt: safeParseNumber(record['Alt(m)'], { fieldName: 'Alt(m)' }),
    }

    const antennaIndex = Number(record['ANT']) || 0
    const data: LogRecord = {
      flightTimeSec: (parsedDate.getTime() - startDate.getTime()) / 1000,
      coordinates,
      altitudeM: safeParseNumber(record['Alt(m)'], {
        fieldName: 'Alt(m)',
        defaultValue: 0,
      }),
      date: parsedDate,
      groundSpeedKmh: safeParseNumber(record['GSpd(kmh)'], {
        fieldName: 'GSpd(kmh)',
        defaultValue: 0,
      }),
      headingDeg: safeParseNumber(record['Hdg(°)'], {
        fieldName: 'Hdg(°)',
        defaultValue: 0,
      }),
      transmitterLinkQuality: safeParseNumber(record['TQly(%)'], {
        fieldName: 'TQly(%)',
        defaultValue: 0,
      }),
      transmitterPowerMw: safeParseNumber(record['TPWR(mW)'], {
        fieldName: 'TPWR(mW)',
        defaultValue: 0,
      }),
      amperageCurrentA: safeParseNumber(record['Curr(A)'], {
        fieldName: 'Curr(A)',
        defaultValue: 0,
      }),
      verticalSpeedMps: safeParseNumber(record['VSpd(m/s)'], {
        fieldName: 'VSpd(m/s)',
        defaultValue: 0,
      }),
      rollRad: safeParseNumber(record['Roll(rad)'], {
        fieldName: 'Roll(rad)',
        defaultValue: 0,
      }),
      pitchRad: safeParseNumber(record['Ptch(rad)'], {
        fieldName: 'Ptch(rad)',
        defaultValue: 0,
      }),
      yawRad: safeParseNumber(record['Yaw(rad)'], {
        fieldName: 'Yaw(rad)',
        defaultValue: 0,
      }),
      recieverLinkQuality: safeParseNumber(record['RQly(%)'], {
        fieldName: 'RQly(%)',
        defaultValue: 0,
      }),
      recieverSSIdB: safeParseNumber(
        antennaIndex === 0 ? record['1RSS(dB)'] : record['2RSS(dB)'],
        {
          fieldName: antennaIndex === 0 ? '1RSS(dB)' : '2RSS(dB)',
          defaultValue: 0,
        },
      ),
      transmitterSSIdB: safeParseNumber(record['TRSS(dB)'], {
        fieldName: 'TRSS(dB)',
        defaultValue: 0,
      }),
      flightMode: record.FM,
      batteryPercent: safeParseNumber(record['Bat%(%)'], {
        fieldName: 'Bat%(%)',
        defaultValue: 0,
      }),
      recieverBatteryVolt: safeParseNumber(record['RxBt(V)'], {
        fieldName: 'RxBt(V)',
        defaultValue: 0,
      }),
      capacityMah: safeParseNumber(record['Capa(mAh)'], {
        fieldName: 'Capa(mAh)',
        defaultValue: 0,
      }),
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
