import React from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Container from './Container'
import { DraggableNode } from '../types/types'

type ListProps = {
  nodes: DraggableNode[]
  parentId: string | null
}

const List: React.FC<ListProps> = ({ nodes, parentId }) => {
  return (
    <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
      {nodes.map((node) => (
        <Container key={node.id} id={node.id} type={node.type} parentId={parentId} content={node.content}>
          {node.children && node.children.length > 0 && <List nodes={node.children} parentId={String(node.id)} />}
        </Container>
      ))}
    </SortableContext>
  )
}

export default List
