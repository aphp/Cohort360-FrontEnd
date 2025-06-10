import { DragEndEvent } from '@dnd-kit/core'

export type DraggableNode = {
  id: string
  type: 'item' | 'group'
  content?: React.ReactNode
  parentId?: string | null
  children?: DraggableNode[]
}

export type DragAndDropProviderProps = {
  children: React.ReactNode
  onDragEnd: (event: DragEndEvent) => void
}
