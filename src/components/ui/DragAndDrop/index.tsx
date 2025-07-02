import React, { ReactNode } from 'react'
import { DragOverlay, useDndContext } from '@dnd-kit/core'
import Draggable from './Draggable'
import { Grid } from '@mui/material'

type Item<T> = T & { id: string | number; disabled?: boolean }

type ListProps<T> = {
  items: Item<T>[]
  groupId: number
  onCreateChild: (item: Item<T>, disabled: boolean) => ReactNode
  spacing?: number | string
}

const List = <T,>({ items, groupId, spacing = 0, onCreateChild }: ListProps<T>) => {
  const { active } = useDndContext()
  console.log('test active', active)

  return (
    <>
      {items.map((item) => (
        <Grid marginTop={spacing} key={`${groupId}-${item.id}`}>
          <Draggable data={{ ...item, groupId }} disabled={item.disabled}>
            {onCreateChild(item, item.disabled ?? false)}
          </Draggable>
        </Grid>
      ))}

      {/*<DragOverlay dropAnimation={null}>
        {active && active.data.current ? (
          <ActiveWrapper>{onCreateChild(active.data.current as Item<T>, false)}</ActiveWrapper>
        ) : null}
      </DragOverlay>*/}
    </>
  )
}

export default List
