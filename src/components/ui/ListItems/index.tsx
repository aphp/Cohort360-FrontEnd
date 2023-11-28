import React, { useEffect, useState } from 'react'
import ListItem, { Item } from './ListItem'
import { List } from '@mui/material'

type ListItemsProps = {
  values: Item[]
  multiple?: boolean
  onchange: (newValue: Item[]) => void
  onItemEyeClick?: (item: Item) => void
  onItemPencilClick?: (item: Item) => void
}

const ListItems = ({ values, multiple = false, onchange, onItemEyeClick, onItemPencilClick }: ListItemsProps) => {
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
    <List>
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
    </List>
  )
}

export default ListItems
