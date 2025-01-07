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
  const [anchorEl, setAnchorEl] = useState(null)

  return (
    <>
      <IconButton
        id="long-button"
        onClick={(event) => {
          event.stopPropagation()
          // @ts-ignore
          setAnchorEl(event.currentTarget)
          //   setSelectedCohort(row)
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={
          !!anchorEl
          // && row.uuid === selectedCohort?.uuid
        }
        onClose={() => setAnchorEl(null)}
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
