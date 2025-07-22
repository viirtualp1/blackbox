/**
 * Уменьшает яркость hex-цвета на `percent` % и добавляет alpha.
 *  @example darken('00ff00', 20, 0.25) → 'rgba(0,204,0,0.25)'
 */
export function darken(color: string, percent = 20, alpha = 0.25): string {
  const hex = `#${color}`

  const int = parseInt(hex.slice(1), 16)
  const clamp = (c: number) => Math.max(0, Math.min(255, c))

  const r = clamp((((int >> 16) & 0xff) * (100 - percent)) / 100)
  const g = clamp((((int >> 8) & 0xff) * (100 - percent)) / 100)
  const b = clamp(((int & 0xff) * (100 - percent)) / 100)

  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`
}

/**
 * Увеличивает яркость hex-цвета на `percent` % и добавляет alpha-канал.
 * @param color    Цвет в формате rrggbb
 * @param percent  Насколько осветлить (0-100), 20 % ≈ «чуть светлее»
 * @param alpha    Прозрачность 0-1, по умолчанию 0.25
 * @returns        Строка вида 'rgba(r,g,b,a)'
 *
 * @example
 *   lighten('#ff0000', 30, 0.3) // rgba(255,179,179,0.3)
 */
export function lighten(color: string, percent = 20, alpha = 0.25): string {
  const hex = `#${color}`

  const int = parseInt(hex.slice(1), 16)
  const clamp = (v: number) => Math.max(0, Math.min(255, v))

  const inc = (c: number) => clamp(c + ((255 - c) * percent) / 100)

  const r = inc((int >> 16) & 0xff)
  const g = inc((int >> 8) & 0xff)
  const b = inc(int & 0xff)

  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`
}
