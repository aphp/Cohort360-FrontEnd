import { Box } from '@mui/material'
import type React from 'react'

import StepperRail, { type StepperItem } from './StepperRail'
import useStyles from './styles'

type Props = {
  header?: React.ReactNode
  /** Left out to show a screen on its own, without the steps rail. */
  steps?: StepperItem[]
  activeStep?: number
  stepProgress?: number
  layout?: 'card' | 'bare'
  children: React.ReactNode
  footer?: React.ReactNode
}

const WizardShell = ({ header, steps, activeStep, stepProgress, layout = 'card', children, footer }: Props) => {
  const { classes, cx } = useStyles()

  return (
    <Box className={classes.page}>
      {header && <Box className={classes.header}>{header}</Box>}
      <Box className={classes.body}>
        <Box className={cx(classes.group, { [classes.groupWithoutRail]: !steps })}>
          {steps && (
            <Box className={classes.stepper}>
              <StepperRail steps={steps} activeStep={activeStep ?? -1} stepProgress={stepProgress} />
            </Box>
          )}
          <Box className={classes.contentCol}>
            {layout === 'card' ? <Box className={cx(classes.card, classes.cardOnboarding)}>{children}</Box> : children}
            {footer && <Box className={classes.footer}>{footer}</Box>}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default WizardShell
