import React, { ReactNode, useState } from 'react'

import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'

type Action = {
  icon: ReactNode
  label: string
  onclick: () => void
  tooltipText?: string
  disabled?: boolean
}

type ActionMenuProps = {
  actions: Action[]
}

// TODO: à revoir je pense, pas adapté

const ActionMenu: React.FC<ActionMenuProps> = ({ actions }) => {
  const [anchorEl, setAnchorEl] = useState<(EventTarget & HTMLButtonElement) | null>(null)

  return (
    <>
      <Tooltip title="Autres actions">
        <IconButton
          id="long-button"
          size="small"
          style={{ color: '#000', padding: 0 }}
          onClick={(event) => {
            event.stopPropagation()
            setAnchorEl(event.currentTarget)
            //   setSelectedCohort(row)
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={
          !!anchorEl
          // && row.uuid === selectedCohort?.uuid
        }
        onClose={() => {
          // TODO: handle onClose with stop propagation?
          setAnchorEl(null)
        }}
      >
        {actions.map((action, index) => (
          <Tooltip title={action.tooltipText} key={index}>
            <span>
              <MenuItem
                //   className={classes.menuItem}
                onClick={(event) => {
                  event.stopPropagation()
                  setAnchorEl(null)
                  action.onclick()
                }}
                disabled={action.disabled}
              >
                <>
                  {action.icon} {action.label}
                </>
              </MenuItem>
            </span>
          </Tooltip>
        ))}
      </Menu>
    </>
  )
}

export default ActionMenu
