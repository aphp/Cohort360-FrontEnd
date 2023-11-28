import React from 'react'
import { ListItemText, Radio, Typography, ListItemIcon, Checkbox } from '@mui/material'
import { ListItemWrapper } from './styles'
import { Edit, Visibility } from '@mui/icons-material'

export type Item = {
  id: string
  name: string
  checked: boolean
}

type ListItemProps = {
  item: Item
  multiple?: boolean
  disabled?: boolean
  onclick: (item: Item) => void
  onEyeClick?: (item: Item) => void
  onPencilClick?: (item: Item) => void
}

const ListItem = ({ item, multiple = false, disabled = false, onclick, onEyeClick, onPencilClick }: ListItemProps) => {
  return (
    <ListItemWrapper key={item.id} divider disableGutters>
      <ListItemIcon>
        {!disabled && !multiple && <Radio checked={item.checked} onChange={() => onclick(item)} color="primary" />}
        {!disabled && multiple && <Checkbox checked={item.checked} onChange={() => onclick(item)} color="error" />}
      </ListItemIcon>
      <ListItemText onClick={() => onclick(item)}>
        <Typography fontWeight={700} color="#00000099">
          {item.name}
        </Typography>
      </ListItemText>

      <ListItemIcon sx={{ minWidth: '48px' }}>
        <Visibility color="primary" fill="#000" onClick={() => onEyeClick && onEyeClick(item)} />
      </ListItemIcon>

      <ListItemIcon sx={{ minWidth: '40px' }}>
        <Edit color="primary" fill="#000" onClick={() => onPencilClick && onPencilClick(item)} />
      </ListItemIcon>
    </ListItemWrapper>
  )
}

export default ListItem
