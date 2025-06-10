import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DragHandleIcon from '@mui/icons-material/DragHandle' // ou autre icône

export type DraggableNode = {
  id: string
  type: 'item' | 'group'
  content?: React.ReactNode
  parentId?: string | null
  children?: DraggableNode[]
}

type ContainerProps = {
  id: string
  type: 'item' | 'group'
  parentId: string | null
  content?: React.ReactNode
  children?: React.ReactNode
}

const Container: React.FC<ContainerProps> = ({ id, type, parentId, content, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    data: { type, parentId }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* 👉 poignée de drag */}
        <div {...listeners} style={{ cursor: 'grab' }}>
          <DragHandleIcon fontSize="small" />
        </div>

        {/* 👉 contenu réel */}
        <div style={{ flexGrow: 1 }}>{content}</div>
      </div>

      {/* 👉 enfants récursifs */}
      {children}
    </div>
  )
}

export default Container
