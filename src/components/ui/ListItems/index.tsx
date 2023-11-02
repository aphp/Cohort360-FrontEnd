import React, { useState } from 'react'
import ListItem, { Item } from './ListItem'
import { List } from '@mui/material'

type ListItemsProps = {
  values: Item[]
  multiple?: boolean
  onchange: (newValue: Item[]) => void
}

const ListItems = ({ values, multiple = false, onchange }: ListItemsProps) => {
  const [items, setItems] = useState(values)

  const handleSelectListItem = (selectedItem: Item) => {
    const newItems = items.map((item) => {
      return { ...item, checked: item.id === selectedItem.id ? !item.checked : multiple ? item.checked : false }
    })
    setItems(newItems)
    onchange(newItems)
  }

  return (
    <List>
      {items.map((item, index) => (
        <ListItem key={index} multiple={multiple} item={item} onclick={(newValue) => handleSelectListItem(newValue)} />
      ))}
    </List>
  )
}

export default ListItems
