import React, { useEffect, useState } from 'react'
import ListItem, { Item } from './ListItem'
import { Grid, List, Typography } from '@mui/material'
import InfiniteScroll from 'react-infinite-scroll-component'

type ListItemsProps = {
  values: Item[]
  multiple?: boolean
  savedFiltersCount: number
  onchange: (newValue: Item[]) => void
  onItemEyeClick?: (item: Item) => void
  onItemPencilClick?: (item: Item) => void
  fetchPaginateData: () => void
}

const FilterListItems = ({
  values,
  multiple = false,
  savedFiltersCount,
  onchange,
  onItemEyeClick,
  onItemPencilClick,
  fetchPaginateData
}: ListItemsProps) => {
  const [items, setItems] = useState(values)

  const handleSelectListItem = (selectedItem: Item) => {
    const newItems = items.map((item) => {
      return { ...item, checked: item.id === selectedItem.id ? !item.checked : multiple ? item.checked : false }
    })
    setItems(newItems)
    onchange(newItems)
  }

  const handleEyeClick = (selectedItem: Item) => {
    if (onItemEyeClick) onItemEyeClick(selectedItem)
  }

  const handlePencilClick = (selectedItem: Item) => {
    if (onItemPencilClick) onItemPencilClick(selectedItem)
  }

  useEffect(() => {
    setItems(values)
  }, [values])

  return (
    <List
      id="scrollableDiv"
      component="nav"
      aria-labelledby="nested-list-subheader"
      style={{ maxHeight: '500px', overflow: 'auto' }}
    >
      <InfiniteScroll
        scrollableTarget="scrollableDiv"
        dataLength={items.length}
        next={fetchPaginateData}
        hasMore={items.length < savedFiltersCount}
        scrollThreshold={0.9}
        loader={
          <Grid container justifyContent="center">
            <Typography fontWeight={500}>Loading...</Typography>
          </Grid>
        }
      >
        {items.map((item, index) => (
          <ListItem
            key={index}
            multiple={multiple}
            item={item}
            onclick={handleSelectListItem}
            onEyeClick={handleEyeClick}
            onPencilClick={handlePencilClick}
          />
        ))}
      </InfiniteScroll>
    </List>
  )
}

export default FilterListItems
