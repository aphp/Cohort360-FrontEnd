import React, { PropsWithChildren, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DraggableWrapper, DroppableWrapper } from './styles'
import { Active, Over } from '@dnd-kit/core'
import { createPortal } from 'react-dom'

type DraggableProps<T> = {
  data: T & { id: string | number }
  disabled?: boolean
  setIsDragging?: (isDragging: boolean) => void
  setIsOver?: (isOver: boolean) => void
  onDrag?: (active: Active | null, over: Over | null) => void
}

const Draggable = <T,>({
  children,
  data,
  disabled = false,
  setIsDragging,
  setIsOver,
  onDrag
}: PropsWithChildren<DraggableProps<T>>) => {
  const { setNodeRef, isDragging, attributes, listeners, transform, isOver, index, activeIndex, over, active } =
    useSortable({
      id: data.id,
      data,
      disabled
    })

  useEffect(() => {
    if (setIsDragging) setIsDragging(isDragging)
  }, [isDragging])

  useEffect(() => {
    if (setIsOver) setIsOver(isOver)
  }, [isOver])

  useEffect(() => {
    if (onDrag) onDrag(active, over)
  }, [active, over])

  const droppableWrapper = document.getElementById(`droppable-wrapper-${index}`)

  return (
    <div style={{ position: 'relative' }}>
      <div id={`droppable-wrapper-${index}`} style={{}}></div>
      {isOver && droppableWrapper && createPortal(<DroppableWrapper>{children}</DroppableWrapper>, droppableWrapper)}
      <DraggableWrapper
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform) }}
        container
        alignItems={'center'}
        isDragging={activeIndex > -1}
        isActive={activeIndex === index}
        {...attributes}
        {...listeners}
      >
        {children}
      </DraggableWrapper>
    </div>
  )
}

export default Draggable
