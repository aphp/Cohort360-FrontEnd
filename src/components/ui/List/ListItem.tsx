import React, { useState } from 'react'
import { ListItemText, Radio, Typography, ListItemIcon, Checkbox, IconButton, Tooltip } from '@mui/material'
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
  const [editTooltipOpen, setEditTooltipOpen] = useState(false)

  const EditPencilIcon = React.forwardRef((props, ref) => (
    <ListItemIcon {...props} ref={ref} sx={{ minWidth: '40px' }}>
      <IconButton
        onClick={() => {
          onPencilClick && onPencilClick(item)
          setEditTooltipOpen(false)
        }}
      >
        <Edit color="primary" fill="#000" />
      </IconButton>
    </ListItemIcon>
  ))

  return (
    <ListItemWrapper key={item.id} divider disableGutters sx={{ cursor: 'default' }}>
      <ListItemIcon>
        {!disabled && !multiple && <Radio checked={item.checked} onChange={() => onclick(item)} color="primary" />}
        {!disabled && multiple && <Checkbox checked={item.checked} onChange={() => onclick(item)} color="error" />}
      </ListItemIcon>
      <ListItemText onClick={() => onclick(item)}>
        <Typography fontWeight={700} color="#00000099">
          {item.name}
        </Typography>
      </ListItemText>

      {onEyeClick && (
        <ListItemIcon sx={{ minWidth: '48px' }}>
          <Tooltip title="Afficher" arrow placement="right">
            <IconButton onClick={() => onEyeClick(item)}>
              <Visibility color="primary" fill="#000" />
            </IconButton>
          </Tooltip>
        </ListItemIcon>
      )}

      {onPencilClick && (
        <Tooltip
          open={editTooltipOpen}
          onOpen={() => setEditTooltipOpen(true)}
          onClose={() => setEditTooltipOpen(false)}
          title="Modifier"
          arrow
          placement="right"
        >
          <EditPencilIcon />
        </Tooltip>
      )}
    </ListItemWrapper>
  )
}

export default ListItem
