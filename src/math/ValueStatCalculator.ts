import { min, max, quantile } from 'simple-statistics'

export interface ValueStat {
  max: number
  min: number
  average: number
  q95: number // 95th percentile
  q99: number // 99th percentile
  uniqueValues: number[] // Optional, only if you need to track unique values
  firstValue: number
  lastValue: number
}

export function isValueStat(stat: unknown): stat is ValueStat {
  return (
    typeof stat === 'object' &&
    stat !== null &&
    'max' in stat &&
    'min' in stat &&
    'average' in stat &&
    'q95' in stat &&
    'q99' in stat &&
    'uniqueValues' in stat &&
    'firstValue' in stat &&
    'lastValue' in stat
  )
}

export class ValueStatCalculator {
  private totalWeight: number = 0
  private totalWeightedSum: number = 0
  private allValues: number[] = []
  private uniqueValuesSet: Set<number> = new Set()

  addValueWeighted(value: number, weight = 1): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Value must be a valid number')
    }

    this.totalWeightedSum += value * weight
    this.totalWeight += weight
    this.allValues.push(value)
    this.uniqueValuesSet.add(value)
  }

  getValue(): ValueStat {
    if (this.allValues.length === 0) {
      return {
        max: -Infinity,
        min: Infinity,
        average: 0,
        q95: 0,
        q99: 0,
        uniqueValues: [],
        firstValue: NaN,
        lastValue: NaN,
      }
    }

    return {
      max: max(this.allValues),
      min: min(this.allValues),
      average:
        this.totalWeight > 0 ? this.totalWeightedSum / this.totalWeight : 0,
      q95: quantile(this.allValues, 0.95),
      q99: quantile(this.allValues, 0.99),
      uniqueValues: Array.from(this.uniqueValuesSet).sort((a, b) => a - b),
      firstValue: this.allValues[0],
      lastValue: this.allValues[this.allValues.length - 1],
    }
  }
}
