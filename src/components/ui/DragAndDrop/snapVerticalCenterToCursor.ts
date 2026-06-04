import type { Modifier } from '@dnd-kit/core'
import { getEventCoordinates } from '@dnd-kit/utilities'

export const snapVerticalCenterToCursor: Modifier = ({ activatorEvent, draggingNodeRect, transform }) => {
  if (draggingNodeRect && activatorEvent) {
    const activatorCoordinates = getEventCoordinates(activatorEvent)
    if (!activatorCoordinates) return transform

    const offsetY = activatorCoordinates.y - draggingNodeRect.top
    const centeredY = transform.y + offsetY - draggingNodeRect.height / 2

    return {
      ...transform,
      y: centeredY
    }
  }

  return transform
}
