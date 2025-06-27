import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DraggableWrapper, DroppableWrapper } from './styles'
import { createPortal } from 'react-dom'

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
  const [prevOver, setPrevOver] = useState(over?.data.current?.groupId ?? null)
  const [visible, setVisible] = useState(false)

  const handleVisible = useCallback(() => {
    if (!isDragging || !over || !active) return false
    if (data.groupId === over.data.current?.groupId && data.groupId !== active.data.current?.groupId) {
      if (over.data.current?.groupId < prevOver && typeof data.id === 'string' && data.id.includes('start')) {
        console.log('test start', over.data.current?.groupId, prevOver, data.id)
        return true
      } else if (over.data.current?.groupId > prevOver && typeof data.id === 'string' && data.id.includes('end')) {
        console.log('test end', over.data.current?.groupId, prevOver, data.id)
        return true
      }
    }
    return false
  }, [active, data.groupId, data.id, isDragging, over, prevOver])

  useEffect(() => {
    setVisible(handleVisible())
    setPrevOver(over?.data.current?.groupId ?? null)
  }, [over?.data.current?.groupId, handleVisible])

  useEffect(() => {
    if (visible) console.log('isVisible', data.id, data.groupId)
  }, [visible])

  return (
    <div style={{ position: 'relative', zIndex: disabled ? 1 : 3 }}>
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
