import React from 'react'
import { ListItemText, Radio, ListItemSecondaryAction, Typography, ListItemIcon, Checkbox } from '@mui/material'
import { ListItemWrapper } from './styles'
import { Visibility } from '@mui/icons-material'

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
}

const ListItem = ({ item, multiple = false, disabled = false, onclick }: ListItemProps) => {
  return (
    <ListItemWrapper key={item.id} divider disableGutters ContainerComponent="div">
      <ListItemIcon>
        <Visibility color="primary" fill="#000" />
      </ListItemIcon>
      <ListItemText onClick={() => onclick(item)}>
        <Typography fontWeight={700} color="#00000099">
          {item.name}
        </Typography>
      </ListItemText>
      <ListItemSecondaryAction>
        {!disabled && !multiple && <Radio checked={item.checked} onChange={() => onclick(item)} color="primary" />}
        {!disabled && multiple && <Checkbox checked={item.checked} onChange={() => onclick(item)} color="error" />}
      </ListItemSecondaryAction>
    </ListItemWrapper>
  )
}

export default ListItem
