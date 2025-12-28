import { describe, expect, test, beforeEach } from 'vitest'
import { DerivativeCalculator } from './DerivativeCalculator'

describe('DerivativeCalculator', () => {
  let calculator: DerivativeCalculator

  beforeEach(() => {
    calculator = new DerivativeCalculator()
  })

  test('should handle empty state', () => {
    const data = calculator.getDerivativeData()
    expect(data.derivative).toBe(0)
    expect(data.averageDerivative).toBe(0)
    expect(data.maxDerivative).toBe(0)
    expect(data.minDerivative).toBe(0)
  })

  test('should calculate derivative correctly', () => {
    // Add first point (no derivative calculated yet)
    calculator.addValue(10, 1)
    expect(calculator.getCurrentDerivative()).toBe(0)

    // Add second point: derivative = (20 - 10) / 1 = 10
    calculator.addValue(20, 1)
    expect(calculator.getCurrentDerivative()).toBe(10)

    // Add third point: derivative = (15 - 20) / 1 = -5
    calculator.addValue(15, 1)
    expect(calculator.getCurrentDerivative()).toBe(-5)

    const data = calculator.getDerivativeData()
    expect(data.derivative).toBe(-5) // Current derivative
    expect(data.averageDerivative).toBe(2.5) // (10 + (-5)) / 2
    expect(data.maxDerivative).toBe(10)
    expect(data.minDerivative).toBe(-5)
  })

  test('should handle constant values', () => {
    calculator.addValue(5, 1)
    calculator.addValue(5, 1)
    calculator.addValue(5, 1)

    const data = calculator.getDerivativeData()
    expect(data.derivative).toBe(0)
    expect(data.averageDerivative).toBe(0)
    expect(data.maxDerivative).toBe(0)
    expect(data.minDerivative).toBe(0)
  })

  test('should handle steep changes', () => {
    calculator.addValue(0, 1)
    calculator.addValue(100, 0.1) // Derivative = 100 / 0.1 = 1000

    expect(calculator.getCurrentDerivative()).toBe(1000)
  })

  test('should throw error for zero time delta', () => {
    calculator.addValue(10, 1)
    expect(() => {
      calculator.addValue(20, 0) // Zero time delta
    }).toThrow(
      'Time delta cannot be zero - would result in infinite derivative',
    )
  })

  test('should throw error for invalid values', () => {
    expect(() => {
      calculator.addValue(NaN, 1)
    }).toThrow('Value must be a valid number')

    expect(() => {
      calculator.addValue(10, NaN)
    }).toThrow('Time must be a valid number')
  })

  test('should reset correctly', () => {
    calculator.addValue(10, 1)
    calculator.addValue(20, 1) // derivative = 10 / 1 = 10
    expect(calculator.getCurrentDerivative()).toBe(10)

    calculator.reset()
    const data = calculator.getDerivativeData()
    expect(data.derivative).toBe(0)
    expect(data.averageDerivative).toBe(0)
    expect(data.maxDerivative).toBe(0)
    expect(data.minDerivative).toBe(0)
  })

  test('should handle decimal time values', () => {
    calculator.addValue(0, 0.5)
    calculator.addValue(5, 1) // Derivative = 5 / 1 = 5

    expect(calculator.getCurrentDerivative()).toBe(5)
  })

  test('should handle negative values', () => {
    calculator.addValue(-10, 1)
    calculator.addValue(-5, 1) // Derivative = 5 / 1 = 5
    calculator.addValue(-15, 1) // Derivative = -10 / 1 = -10

    const data = calculator.getDerivativeData()
    expect(data.derivative).toBe(-10)
    expect(data.averageDerivative).toBe(-2.5) // (5 + (-10)) / 2
    expect(data.maxDerivative).toBe(5)
    expect(data.minDerivative).toBe(-10)
  })
})
