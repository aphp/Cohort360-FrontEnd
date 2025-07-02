import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DraggableWrapper, DroppableWrapper } from './styles'
import { createPortal } from 'react-dom'
import { Over } from '@dnd-kit/core'

type DraggableProps<T> = {
  data: T & { id: string | number; groupId: string | number }
  disabled?: boolean
}

const Draggable = <T,>({ children, data, disabled = false }: PropsWithChildren<DraggableProps<T>>) => {
  const { setNodeRef, attributes, listeners, transform, isOver, index, activeIndex, active, over } = useSortable({
    id: data.id,
    data,
    disabled
  })
  const droppableWrapper = document.getElementById(`droppable-wrapper-${index}`)
  const isDragging = activeIndex > -1
  const isActive = activeIndex === index
  const [prevOver, setPrevOver] = useState(over ?? null)
  const [visible, setVisible] = useState(false)

  const handleVisible = useCallback(
    (prev: Over | null) => {
      if (!isDragging || !over || !active || !prev) return false

      const currentGroupId = over.data.current?.groupId
      const prevGroupId = prev.data.current?.groupId
      const isSameGroup = data.groupId === active.data.current?.groupId

      if (isSameGroup || currentGroupId !== data.groupId) return false

      const isBefore = currentGroupId < prevGroupId
      const isStart = typeof data.id === 'string' && data.id.includes('start')
      const isAfter = currentGroupId > prevGroupId
      const isEnd = typeof data.id === 'string' && data.id.includes('end')

      return (isBefore && isStart) || (isAfter && isEnd)
    },
    [active, data.groupId, data.id, isDragging, over]
  )

  useEffect(() => {
    setVisible(handleVisible(prevOver))
    setPrevOver(over)
  }, [over?.data.current?.groupId])

  return (
    <div style={{ position: 'relative' }}>
      <div id={`droppable-wrapper-${index}`} />
      {isOver &&
        (!disabled || (disabled && visible)) &&
        droppableWrapper &&
        createPortal(<DroppableWrapper>{children}</DroppableWrapper>, droppableWrapper)}
      <DraggableWrapper
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform) }}
        isDragging={isDragging}
        isActive={isActive}
        visible={visible}
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        {children}
      </DraggableWrapper>
    </div>
  )
}

export default Draggable
