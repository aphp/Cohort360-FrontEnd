import React, { PropsWithChildren, useMemo } from 'react'
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
  const { setNodeRef, attributes, listeners, transform, isOver, index, activeIndex, active } = useSortable({
    id: data.id,
    data,
    disabled
  })
  const droppableWrapper = document.getElementById(`droppable-wrapper-${index}`)
  const isDragging = activeIndex > -1
  const isActive = activeIndex === index

  const isValidPlaceholder = useMemo(() => {
    if (!isDragging || typeof data.id !== 'string') return false
    const match = /^(start|end)-(-?\d+)$/.exec(data.id)
    if (!match) return false
    const [, type, groupIdStr] = match
    const groupId = Number(groupIdStr)
    const activeGroupId = active?.data.current?.groupId
    if (
      (type === 'start' && (groupId === activeGroupId || activeGroupId < groupId)) ||
      (type === 'end' && (groupId === activeGroupId || activeGroupId > groupId))
    )
      return false
    return true
  }, [data.id, isDragging, active])

  return (
    <div style={{ position: 'relative' }}>
      <div id={`droppable-wrapper-${index}`} />
      {((!dropZone && !disabled) || isValidPlaceholder) &&
        droppableWrapper &&
        createPortal(<DroppableWrapper isActive={isOver}>{children}</DroppableWrapper>, droppableWrapper)}
      {(!dropZone || isValidPlaceholder) && (
        <DraggableWrapper
          id={`draggable-item-${data.id}`}
          ref={disabled ? undefined : setNodeRef}
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
