import { Box } from '@mui/material'
import type { ComponentType, SVGProps } from 'react'
import React from 'react'

import useStyles from './styles'

type Props = {
  image: ComponentType<SVGProps<SVGSVGElement>>
  /** Described to assistive technologies, which cannot read the artwork. */
  label: string
}

const Illustration = ({ image: Image, label }: Props) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.illustrationRow}>
      <Image className={classes.illustration} role="img" aria-label={label} />
    </Box>
  )
}

export default Illustration
