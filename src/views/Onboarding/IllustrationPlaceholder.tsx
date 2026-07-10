import { Box, Typography } from '@mui/material'
import React from 'react'

import useStyles from './styles'

type Props = {
  /** Describes the artwork expected here; also read out to assistive technologies. */
  label: string
}

// Stands in for the Figma artwork until the final assets are delivered.
const IllustrationPlaceholder = ({ label }: Props) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.illustrationRow}>
      <Box className={classes.illustrationPlaceholder} role="img" aria-label={label}>
        <Typography variant="body2">{label}</Typography>
      </Box>
    </Box>
  )
}

export default IllustrationPlaceholder
