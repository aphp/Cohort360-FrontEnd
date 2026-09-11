import CheckIcon from '@mui/icons-material/Check'
import { Box, Typography } from '@mui/material'
import React from 'react'

import useStyles from './styles'

export type StepperItem = {
  key: string
  label: string
}

type Props = {
  steps: StepperItem[]
  /** -1 while the welcome screen is shown, so that no step reads as reached. */
  activeStep: number
  /** How far the active step has travelled through its own screens, from 0 to 1. */
  stepProgress?: number
}

const clampRatio = (value: number) => Math.min(Math.max(value, 0), 1)

/**
 * Rendered by hand rather than with MUI's Stepper: the connector below the active step
 * fills up as its screens are visited, which a plain `StepConnector` cannot express.
 *
 * Each item is a head (circle and label, vertically centred on one another) above a tail
 * holding the segment, so a two-line label stays centred on its circle.
 */
const StepperRail = ({ steps, activeStep, stepProgress = 0 }: Props) => {
  const { classes, cx } = useStyles()

  const fillOf = (index: number) => {
    if (index < activeStep) return 1
    if (index === activeStep) return clampRatio(stepProgress)
    return 0
  }

  return (
    <ol className={classes.rail}>
      {steps.map((step, index) => {
        const completed = index < activeStep
        const active = index === activeStep
        const isLast = index === steps.length - 1

        return (
          <li key={step.key} className={classes.railItem}>
            <Box className={classes.railHead}>
              <span
                className={cx(
                  classes.stepCircle,
                  completed && classes.stepCircleCompleted,
                  active && classes.stepCircleActive
                )}
              >
                {completed ? <CheckIcon fontSize="small" titleAccess="Étape terminée" /> : index + 1}
              </span>
              <Typography
                component="span"
                aria-current={active ? 'step' : undefined}
                className={cx(classes.stepLabel, active && classes.stepLabelActive)}
              >
                {step.label}
              </Typography>
            </Box>
            {!isLast && (
              <Box className={classes.railTail}>
                <span className={classes.railSegment} aria-hidden>
                  <span className={classes.railSegmentFill} style={{ height: `${fillOf(index) * 100}%` }} />
                </span>
              </Box>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default StepperRail
