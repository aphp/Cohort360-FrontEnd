import React, { PropsWithChildren, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DraggableWrapper, DroppableWrapper, InvisibleWrapper } from './styles'
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
  const isInvisible = disabled && data.groupId !== active?.data.current?.groupId && !isOver
  /*activeIndex < 0 && !isOver &&
    (!isDragging || (active && active?.data.current?.groupId === over?.data.current?.groupId)) /*&&
    active?.data.current?.groupId !== over?.data.current?.groupId //disabled /*&& (activeIndex < 0 || active?.data.current?.groupId === over?.data.current?.groupId)*/
  const isPresent = !disabled || (disabled && data.groupId !== active?.data.current?.groupId)

  useEffect(() => {
    if (over?.data.current.groupId === -1 && active?.data.current.groupId === 0 && isOver)
      console.log('invisible', isInvisible)
  }, [over])

  return (
    <div style={{ position: 'relative', zIndex: isInvisible ? 1 : 3 }}>
      <div id={`droppable-wrapper-${index}`}></div>
      {isOver && droppableWrapper && createPortal(<DroppableWrapper>{children}</DroppableWrapper>, droppableWrapper)}
      {isPresent && (
        <DraggableWrapper
          ref={setNodeRef}
          style={{
            transform: CSS.Translate.toString(transform)
          }}
          isDragging={isDragging}
          isActive={isActive}
          //isPresent={isPresent}
          isInvisible={isInvisible}
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
