import { ValueStat } from '@/math/ValueStatCalculator'

export interface EdgeTXLogRecord {
  Date: string // YYYY-MM-DD
  Time: string // HH:mm:ss.SSS
  '1RSS(dB)': number
  '2RSS(dB)': number
  'RQly(%)': number
  'RSNR(dB)': number
  ANT: number
  RFMD: number
  'TPWR(mW)': number
  'TRSS(dB)': number
  'TQly(%)': number
  'TSNR(dB)': number
  GPS: string // "lat lng"
  'GSpd(kmh)': number
  'Hdg(°)': number
  'Alt(m)': number
  Sats: number
  'RxBt(V)': number
  'Curr(A)': number
  'Capa(mAh)': number
  'Bat%(%)': number
  'Ptch(rad)': number
  'Roll(rad)': number
  'Yaw(rad)': number
  FM: string
  'VSpd(m/s)': number
  Rud: number
  Ele: number
  Thr: number
  Ail: number
  S1: number
  S2: number
  SA: number
  SB: number
  SC: number
  SD: number
  SE: number
  SF: number
  SG: number
  SH: number
  LSW: string
  'CH1(us)': number
  'CH2(us)': number
  'CH3(us)': number
  'CH4(us)': number
  'CH5(us)': number
  'CH6(us)': number
  'CH7(us)': number
  'CH8(us)': number
  'CH9(us)': number
  'CH10(us)': number
  'CH11(us)': number
  'CH12(us)': number
  'CH13(us)': number
  'CH14(us)': number
  'CH15(us)': number
  'CH16(us)': number
  'CH17(us)': number
  'CH18(us)': number
  'CH19(us)': number
  'CH20(us)': number
  'CH21(us)': number
  'CH22(us)': number
  'CH23(us)': number
  'CH24(us)': number
  'CH25(us)': number
  'CH26(us)': number
  'CH27(us)': number
  'CH28(us)': number
  'CH29(us)': number
  'CH30(us)': number
  'CH31(us)': number
  'CH32(us)': number
  'TxBat(V)': number
}

export interface Log {
  records: LogRecord[]
  startDate: Date
  endDate: Date
  durationSec: number
  title: string
}

export interface LogStats {
  altitude: ValueStat
  groundSpeedKmh: ValueStat
}

export interface LogRecord {
  flightTimeSec: number
  coordinates: LocationData
  altitudeM: number
  date: Date
  groundSpeedKmh: number
  headingDeg: number
  transmitterLinkQuality: number
  recieverLinkQuality: number
  transmitterPowerMw: number
  amperageCurrentA: number
  verticalSpeedMps: number
  rollRad: number
  pitchRad: number
  yawRad: number
  recieverSSIdB: number
  transmitterSSIdB: number
  flightMode: string
  capacityMah: number
  batteryPercent: number
  recieverBatteryVolt: number

  $resample?: {
    deviationSec?: number // deviation from the original record in seconds
    interpolated?: boolean // whether this record was created by interpolation
    originalFirstRecord?: LogRecord // the first record used for interpolation
    originalSecondRecord?: LogRecord // the second record used for interpolation
    time: number
  }
}

export interface LogStatistics {
  altitudeM: ValueStat
  verticalSpeedMps: ValueStat
  groundSpeedKmh: ValueStat
  transmitterPowerMw: ValueStat
  transmitterLinkQuality: ValueStat
  amperageCurrentA: ValueStat
  recieverLinkQuality: ValueStat

  totalDistanceM: number
  totalDistanceFlatM: number
  fullCapacityMah: number
  mahPerKm: number
  mahPerMinute: number

  durationSec: number
  altitudeChangePerKm: number

  avgGlideSlopeDeg: number
}
