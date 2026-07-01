import { Box } from '@mui/material'
import type React from 'react'

import StepperRail, { type StepperItem } from './StepperRail'
import useStyles from './styles'

type Props = {
  header?: React.ReactNode
  steps: StepperItem[]
  activeStep: number
  children: React.ReactNode
  footer?: React.ReactNode
}

const WizardShell = ({ header, steps, activeStep, children, footer }: Props) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.page}>
      {header && <Box className={classes.header}>{header}</Box>}
      <Box className={classes.body}>
        <Box className={classes.group}>
          <Box className={classes.stepper}>
            <StepperRail steps={steps} activeStep={activeStep} />
          </Box>
          <Box className={classes.contentCol}>
            <Box className={classes.card}>{children}</Box>
            {footer && <Box className={classes.footer}>{footer}</Box>}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default WizardShell
