import React from 'react'
import { Link, LinkProps, ListItem } from '@mui/material'

import useStyles from './styles'

const NestedLink: React.FC<LinkProps> = (props) => {
  const { classes } = useStyles()

  return (
    <ListItem>
      <Link underline="hover" className={classes.nestedTitle} {...props} />
    </ListItem>
  )
}

export default NestedLink
