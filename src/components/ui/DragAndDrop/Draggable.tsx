import React, { PropsWithChildren } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DraggableWrapper, DroppableWrapper } from './styles'
import { createPortal } from 'react-dom'

type DraggableProps<T> = {
  data: T & { id: string | number; groupId: string | number }
  disabled?: boolean
}

const Draggable = <T,>({ children, data, disabled = false }: PropsWithChildren<DraggableProps<T>>) => {
  const { setNodeRef, attributes, listeners, transform, isOver, index, activeIndex, active } = useSortable({
    id: data.id,
    data,
    disabled
  })
  const droppableWrapper = document.getElementById(`droppable-wrapper-${index}`)

  return (
    <div style={{ position: 'relative' }}>
      <div id={`droppable-wrapper-${index}`}></div>
      {isOver && droppableWrapper && createPortal(<DroppableWrapper>{children}</DroppableWrapper>, droppableWrapper)}
      {!(disabled && active?.data?.current?.groupId === data.groupId) && (
        <DraggableWrapper
          ref={setNodeRef}
          style={{
            transform: CSS.Transform.toString(transform)
          }}
          container
          alignItems={'center'}
          isDragging={activeIndex > -1}
          isActive={activeIndex === index}
          isDisabled={disabled}
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
