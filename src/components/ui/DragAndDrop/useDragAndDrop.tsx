import React, { useCallback, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

// Types
export type DraggableNode = {
  id: string
  type: 'item' | 'group'
  content?: React.ReactNode
  parentId?: string | null
  children?: DraggableNode[]
}

type DragAndDropProviderProps = {
  children: React.ReactNode
  initialNodes: DraggableNode[]
  onChange?: (nodes: DraggableNode[]) => void
}

export const useDragAndDrop = () => {
  const [nodes, setNodes] = useState<DraggableNode[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function removeNode(tree: DraggableNode[], id: string): [DraggableNode | null, DraggableNode[]] {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].id === id) {
        const node = tree[i]
        const newTree = [...tree]
        newTree.splice(i, 1)
        return [node, newTree]
      }
      if (tree[i].children) {
        const [node, newChildren] = removeNode(tree[i].children!, id)
        if (node) {
          const newTree = [...tree]
          newTree[i] = { ...newTree[i], children: newChildren }
          return [node, newTree]
        }
      }
    }
    return [null, tree]
  }

  function insertNode(tree: DraggableNode[], parentId: string | null, node: DraggableNode): DraggableNode[] {
    if (parentId === null) {
      return [...tree, node]
    }

    return tree.map((n) => {
      if (n.id === parentId) {
        const children = n.children ? [...n.children, node] : [node]
        return { ...n, children }
      }
      if (n.children) {
        return { ...n, children: insertNode(n.children, parentId, node) }
      }
      return n
    })
  }

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const [movedNode, treeWithoutMoved] = removeNode(nodes, String(active.id))
      if (!movedNode) return

      const newParentId = movedNode.type === 'item' ? null : String(over.id)

      const newTree = insertNode(treeWithoutMoved, newParentId, movedNode)

      setNodes(newTree)
    },
    [nodes]
  )

  const DragAndDropProvider: React.FC<DragAndDropProviderProps> = ({ children, initialNodes, onChange }) => {
    React.useEffect(() => {
      setNodes(initialNodes)
    }, [initialNodes])

    React.useEffect(() => {
      if (onChange) onChange(nodes)
    }, [nodes, onChange])

    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        {children}
      </DndContext>
    )
  }

  return { DragAndDropProvider, nodes, setNodes }
}
