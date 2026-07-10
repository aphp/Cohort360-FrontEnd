import CheckIcon from '@mui/icons-material/Check'
import {
  Step,
  StepConnector,
  stepConnectorClasses,
  type StepIconProps,
  StepLabel,
  Stepper,
  styled
} from '@mui/material'
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

const RailConnector = styled(StepConnector)(({ theme }) => ({
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.primary.main
  }
}))

const StepperRail = ({ steps, activeStep }: Props) => {
  const { classes, cx } = useStyles()

  const StepNumber = ({ icon, active, completed }: StepIconProps) => (
    <span
      className={cx(classes.stepCircle, active && classes.stepCircleActive, completed && classes.stepCircleCompleted)}
    >
      {completed ? <CheckIcon fontSize="small" titleAccess="Étape terminée" /> : icon}
    </span>
  )

  // Linear on purpose: MUI derives `completed` from activeStep, and the rail is not clickable.
  return (
    <Stepper activeStep={activeStep} orientation="vertical" connector={<RailConnector />}>
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
