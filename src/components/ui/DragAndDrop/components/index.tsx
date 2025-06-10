import React, { PropsWithChildren } from 'react'
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

type Draggable = {
  id: string
  parentId?: string // permet de suivre la hiérarchie
  type: 'group' | 'item'
}

type WrapperProps = PropsWithChildren<{
  items: Draggable[]
  onDragEnd: (event: DragEndEvent) => void
}>

const Wrapper: React.FC<WrapperProps> = ({ items, onDragEnd, children }) => {
  const sensors = useSensors(useSensor(PointerSensor))

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
      <DragOverlay>{/* Optionnel : afficher un aperçu de l'élément en train d'être déplacé */}</DragOverlay>
    </DndContext>
  )
}

export default Wrapper
