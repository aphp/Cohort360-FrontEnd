import { Typography } from '@mui/material'
import React from 'react'

import useStyles from './styles'

type Props = {
  label: string
}

const ScreenTag = ({ label }: Props) => {
  const { classes } = useStyles()

  return (
    <Typography component="span" className={classes.screenTag}>
      {label}
    </Typography>
  )
}

export default ScreenTag
