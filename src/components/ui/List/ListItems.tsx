import React, { useEffect, useRef, useState } from 'react'
import ListItem, { Item } from './ListItem'
import { Grid, List as ListMui, Typography } from '@mui/material'
import InfiniteScroll from 'react-infinite-scroll-component'
import { v4 as uuidv4 } from 'uuid'

type ListItemsProps = {
  values: Item[]
  multiple?: boolean
  count: number
  onchange: (newValue: Item[]) => void
  fetchPaginateData: () => void
}

const ListItems = ({ values, multiple = false, count, onchange, fetchPaginateData }: ListItemsProps) => {
  const [items, setItems] = useState(values)
  const scrollableUuid = useRef(uuidv4())

  const handleSelectListItem = (selectedItem: Item) => {
    const newItems = items.map((item) => {
      return { ...item, checked: item.id === selectedItem.id ? !item.checked : multiple ? item.checked : false }
    })
    setItems(newItems)
    onchange(newItems)
  }

  useEffect(() => {
    setItems(values)
  }, [values])

  return (
    <ListMui
      id={scrollableUuid.current}
      component="nav"
      aria-labelledby="nested-list-subheader"
      style={{ maxHeight: '500px', overflow: 'auto' }}
    >
      <InfiniteScroll
        scrollableTarget={scrollableUuid.current}
        dataLength={items.length}
        next={fetchPaginateData}
        hasMore={items.length < count}
        scrollThreshold={0.9}
        loader={
          <Grid container justifyContent="center">
            <Typography fontWeight={500}>Loading...</Typography>
          </Grid>
        }
      >
        {items.map((item, index) => (
          <ListItem key={index} multiple={multiple} item={item} onclick={handleSelectListItem} />
        ))}
      </InfiniteScroll>
    </ListMui>
  )
}

export default ListItems
