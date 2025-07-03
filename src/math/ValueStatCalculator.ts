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

export class ValueStatCalculator {
  private value: ValueStat
  private totalWeight: number = 0
  private totalWeightedSum: number = 0
  private allValues: number[] = []
  private uniqueValuesSet: Set<number> = new Set()

  constructor() {
    this.value = {
      max: -Infinity,
      min: Infinity,
      average: 0,
      q95: NaN,
      q99: NaN,
      uniqueValues: [],
      firstValue: NaN,
      lastValue: NaN,
    }
  }

  addValueWeighted(value: number, weight = 1): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Value must be a valid number')
    }

    if (value > this.value.max) {
      this.value.max = value
    }
    if (value < this.value.min) {
      this.value.min = value
    }

    this.totalWeightedSum += value * weight
    this.totalWeight += weight
    this.value.average = this.totalWeightedSum / this.totalWeight

    this.allValues.push(value)
    this.uniqueValuesSet.add(value)
  }

  calculatePercentiles(): { q95: number; q99: number } {
    if (this.allValues.length === 0) {
      return { q95: 0, q99: 0 }
    }

    const sortedValues = [...this.allValues].sort((a, b) => a - b)
    const n = sortedValues.length
    if (n === 0) {
      return {
        ...this.value,
        q95: 0,
        q99: 0,
      }
    }

    const q95Index = Math.floor(n * 0.95)
    const q99Index = Math.floor(n * 0.99)
    const q95 = sortedValues[q95Index]
    const q99 = sortedValues[q99Index]

    return {
      q95,
      q99,
    }
  }

  getValue(): ValueStat {
    return {
      ...this.value,
      ...this.calculatePercentiles(),
      uniqueValues: Array.from(this.uniqueValuesSet).sort((a, b) => a - b),
      firstValue: this.allValues[0] ?? NaN,
      lastValue: this.allValues[this.allValues.length - 1] ?? NaN,
    }
  }
}
