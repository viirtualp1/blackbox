export interface StatTableRow {
  metric: string
  avg?: string
  min?: string
  max?: string
  value?: string
}

export interface StatSection {
  title: string
  icon: React.ComponentType<any>
  data: StatTableRow[]
  type: 'minMaxAvg' | 'valueOnly'
}
