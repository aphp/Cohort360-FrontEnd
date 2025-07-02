import React, { PropsWithChildren, useEffect, useMemo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DraggableWrapper, DroppableWrapper } from './styles'
import { createPortal } from 'react-dom'

type DraggableProps<T> = {
  data: T & { id: string | number; groupId: string | number }
  disabled?: boolean
}

const Draggable = <T,>({ children, data, disabled = false }: PropsWithChildren<DraggableProps<T>>) => {
  const { setNodeRef, attributes, listeners, transform, isOver, index, activeIndex, active, items } = useSortable({
    id: data.id,
    data
    //  disabled
  })
  const droppableWrapper = document.getElementById(`droppable-wrapper-${index}`)
  const isDragging = activeIndex > -1
  const isActive = activeIndex === index

  const placeholders = useMemo(() => {
    console.log('test items', items)
    if (!isDragging) return []
    const targetId = active?.data.current?.groupId * -1
    return items.filter((item) => {
      if (typeof item !== 'string') return true
      const match = item.match(/^(start|end)-(-?\d+)$/)
      if (!match) return true
      const [, type, groupIdStr] = match
      const groupId = Number(groupIdStr)
      if (
        (type === 'start' && (groupId === targetId || groupId < targetId)) ||
        (type === 'end' && (groupId === targetId || groupId > targetId))
      )
        return false
      return true
    })
  }, [items, isDragging, active])

  useEffect(() => {
    console.log('test placeholder', placeholders)
  }, [placeholders])

  return (
    <div style={{ position: 'relative' }}>
      <div id={`droppable-wrapper-${index}`} />
      {placeholders.includes(data.id) &&
        droppableWrapper &&
        createPortal(<DroppableWrapper isActive={isOver}>{children}</DroppableWrapper>, droppableWrapper)}
      {(!disabled || placeholders.includes(data.id)) && (
        <DraggableWrapper
          ref={setNodeRef}
          style={{ transform: CSS.Translate.toString(transform) }}
          isDragging={isDragging}
          isActive={isActive}
          visible={!disabled}
          disabled={disabled}
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
