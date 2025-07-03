import React, { PropsWithChildren, useEffect, useMemo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DraggableWrapper, DroppableWrapper } from './styles'
import { createPortal } from 'react-dom'
import { UniqueIdentifier } from '@dnd-kit/core'

type DraggableProps<T> = {
  data: T & { id: UniqueIdentifier; groupId: UniqueIdentifier }
  dropZone?: boolean
  disabled?: boolean
}

const Draggable = <T,>({
  children,
  data,
  disabled = false,
  dropZone = false
}: PropsWithChildren<DraggableProps<T>>) => {
  const { setNodeRef, attributes, listeners, transform, isOver, index, activeIndex, active, items } = useSortable({
    id: data.id,
    data,
    disabled
  })
  const droppableWrapper = document.getElementById(`droppable-wrapper-${index}`)
  const isDragging = activeIndex > -1
  const isActive = activeIndex === index

  const placeholders = useMemo(() => {
    if (!isDragging) return []
    const targetId = active?.data.current?.groupId
    return items.filter((item) => {
      if (typeof item !== 'string') return true
      const match = item.match(/^(start|end|operator)-(-?\d+)$/)
      if (!match) return true
      const [, type, groupIdStr] = match
      const groupId = Number(groupIdStr)
      if (
        type === 'operator' ||
        (type === 'start' && (groupId === targetId || targetId < groupId)) ||
        (type === 'end' && (groupId === targetId || targetId > groupId))
      )
        return false
      return true
    })
  }, [items, isDragging, active])

  return (
    <div style={{ position: 'relative' }}>
      <div id={`droppable-wrapper-${index}`} />
      {placeholders.includes(data.id) &&
        droppableWrapper &&
        createPortal(<DroppableWrapper isActive={isOver}>{children}</DroppableWrapper>, droppableWrapper)}
      {(!dropZone || placeholders.includes(data.id)) && (
        <DraggableWrapper
          ref={setNodeRef}
          style={{
            transform: CSS.Translate.toString(transform),
            transition: transform ? 'none' : 'transform 200ms ease'
          }}
          isDragging={isDragging}
          isActive={isActive}
          isDisabled={disabled}
          isDropZone={dropZone}
          {...attributes}
          {...listeners}
        >
          {children}
        </DraggableWrapper>
      )}
    </div>
  )
}

export default Draggable
