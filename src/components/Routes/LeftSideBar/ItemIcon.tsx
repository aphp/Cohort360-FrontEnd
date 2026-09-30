import React, { ReactElement } from 'react'
import { ListItemIcon, Tooltip } from '@mui/material'

import useStyles from './styles'

const ItemIcon: React.FC<{ title: string; open: boolean; children: ReactElement }> = ({ title, open, children }) => {
  const { classes } = useStyles()

  return (
    <Tooltip title={open ? '' : title}>
      <ListItemIcon className={classes.listIcon}>{children}</ListItemIcon>
    </Tooltip>
  )
}

export default ItemIcon
