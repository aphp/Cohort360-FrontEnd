import React, { ReactNode, useState } from 'react'

import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'

type ActionMenuProps = {
  actions: {
    key: string
    onclick: () => void
    icon: ReactNode
    label: string
  }[]
  disabled?: boolean
}

const ActionMenu: React.FC<ActionMenuProps> = ({ actions, disabled = false }) => {
  const [anchorEl, setAnchorEl] = useState<(EventTarget & HTMLButtonElement) | null>(null)

  return (
    <>
      <Tooltip title="Autres actions">
        <IconButton
          id="actions"
          size="small"
          style={{ color: '#2b2b2b', padding: 0 }}
          onClick={(event) => {
            event.stopPropagation()
            setAnchorEl(event.currentTarget)
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={(event: React.MouseEvent) => {
          event.stopPropagation()
          setAnchorEl(null)
        }}
      >
        {actions.map((action) => (
          <MenuItem
            onClick={(event) => {
              event.stopPropagation()
              action.onclick()
              setAnchorEl(null)
            }}
            key={action.key}
            disabled={disabled}
          >
            <ListItemIcon>{action.icon}</ListItemIcon>
            <ListItemText>{action.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default ActionMenu
