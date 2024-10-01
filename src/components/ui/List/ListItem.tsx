import React from 'react'
import { ListItemText, Radio, Typography, ListItemIcon, Checkbox } from '@mui/material'
import { ListItemWrapper } from './styles'

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

const ListItem = ({ item, multiple = false, disabled = false, onclick }: ListItemProps) => {
  return (
    <ListItemWrapper key={item.id} divider disableGutters sx={{ cursor: 'default' }}>
      <ListItemIcon>
        {!disabled && !multiple && <Radio checked={item.checked} onChange={() => onclick(item)} color="info" />}
        {!disabled && multiple && <Checkbox checked={item.checked} onChange={() => onclick(item)} color="info" />}
      </ListItemIcon>
      <ListItemText onClick={() => onclick(item)}>
        <Typography fontWeight={700} color="#00000099">
          {item.name}
        </Typography>
      </ListItemText>
    </ListItemWrapper>
  )
}

export default ListItem
