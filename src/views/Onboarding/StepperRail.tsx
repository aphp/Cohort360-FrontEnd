import { Step, type StepIconProps, StepLabel, Stepper } from '@mui/material'
import React from 'react'

import useStyles from './styles'

export type StepperItem = {
  key: string
  label: string
}

type Props = {
  steps: StepperItem[]
  activeStep: number
}

const StepperRail = ({ steps, activeStep }: Props) => {
  const { classes, cx } = useStyles()

  const StepNumber = ({ icon, active, completed }: StepIconProps) => (
    <span className={cx(classes.stepCircle, (active || completed) && classes.stepCircleActive)}>{icon}</span>
  )

  return (
    <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
      {steps.map((step) => (
        <Step key={step.key}>
          <StepLabel StepIconComponent={StepNumber} classes={{ label: classes.stepLabel }}>
            {step.label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  )
}

export default StepperRail
