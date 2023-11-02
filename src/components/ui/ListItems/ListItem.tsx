import React from 'react'
import {
  ListItemText,
  Radio,
  ListItemSecondaryAction,
  Typography,
  ListItemIcon,
  Checkbox,
  Tooltip,
  IconButton
} from '@mui/material'
import { ListItemWrapper } from './styles'
import { Edit, Visibility } from '@mui/icons-material'
import { useAppSelector } from 'state'
import { MeState } from 'state/me'

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
}

const ListItem = ({ item, multiple = false, disabled = false, onclick, onEyeClick }: ListItemProps) => {
  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const maintenanceIsActive = meState?.maintenance?.active

  return (
    <ListItemWrapper key={item.id} divider disableGutters ContainerComponent="div">
      <ListItemText onClick={() => onclick(item)}>
        <Typography fontWeight={700} color="#00000099">
          {item.name}
        </Typography>
      </ListItemText>
      <ListItemSecondaryAction>
        {!disabled && !multiple && <Radio checked={item.checked} onChange={() => onclick(item)} color="primary" />}
        {!disabled && multiple && <Checkbox checked={item.checked} onChange={() => onclick(item)} color="error" />}
      </ListItemSecondaryAction>
      <ListItemIcon sx={{ minWidth: '48px' }}>
        <Tooltip title="Options du filtre" arrow placement="right">
          <IconButton onClick={() => onEyeClick && onEyeClick(item)}>
            <Visibility color="primary" fill="#000" />
          </IconButton>
        </Tooltip>
      </ListItemIcon>
      {maintenanceIsActive ? (
        <Tooltip title="Ce bouton est désactivé en raison de maintenance en cours." arrow placement="right">
          <Edit />
        </Tooltip>
      ) : (
        <Edit />
      )}
    </ListItemWrapper>
  )
}

export default ListItem
