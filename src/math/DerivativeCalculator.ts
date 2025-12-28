import { min, max, mean } from 'simple-statistics'

export interface DerivativeData {
  derivative: number // Current derivative value
  averageDerivative: number // Average derivative over all samples
  maxDerivative: number // Maximum derivative encountered
  minDerivative: number // Minimum derivative encountered
  derivatives: number[] // All calculated derivatives
}

export class DerivativeCalculator {
  private prevValue: number | null = null
  private derivatives: number[] = []

  addValue(value: number, timeDelta: number): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Value must be a valid number')
    }
    if (typeof timeDelta !== 'number' || isNaN(timeDelta)) {
      throw new Error('Time must be a valid number')
    }
    if (timeDelta === 0) {
      throw new Error(
        'Time delta cannot be zero - would result in infinite derivative',
      )
    }

    if (this.prevValue !== null) {
      const derivative = (value - this.prevValue) / timeDelta
      this.derivatives.push(derivative)
    }

    this.prevValue = value
  }

  getCurrentDerivative(): number {
    if (this.derivatives.length === 0) {
      return 0
    }
    return this.derivatives[this.derivatives.length - 1]
  }

  getDerivativeData(): DerivativeData {
    if (this.derivatives.length === 0) {
      return {
        derivatives: [],
        derivative: 0,
        averageDerivative: 0,
        maxDerivative: 0,
        minDerivative: 0,
      }
    }

    return {
      derivatives: this.derivatives,
      derivative: this.getCurrentDerivative(),
      averageDerivative: mean(this.derivatives),
      maxDerivative: max(this.derivatives),
      minDerivative: min(this.derivatives),
    }
  }

  reset(): void {
    this.prevValue = null
    this.derivatives = []
  }
}
