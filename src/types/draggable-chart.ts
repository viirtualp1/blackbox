export interface DraggableSelectEvent {
  range: [number, number]
}

export interface GetDraggableSelectRangeOptions {
  onSelect: (event: DraggableSelectEvent) => void
}
