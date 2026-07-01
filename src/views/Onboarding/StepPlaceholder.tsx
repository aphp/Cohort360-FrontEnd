import { Box, Typography } from '@mui/material'
import React from 'react'

import type { OnboardingStepConfig } from './steps'
import useStyles from './styles'

type Props = {
  step: OnboardingStepConfig
}

// Detailed step content is out of scope here; this story only wires the shell.
const StepPlaceholder = ({ step }: Props) => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        {step.label}
      </Typography>
    </Box>
  )
}

export default StepPlaceholder
