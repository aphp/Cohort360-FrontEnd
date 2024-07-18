import React from 'react'
import { StyledFormLabel } from './styles'
import { FormLabelProps } from '@mui/material'

export const CriteriaLabel = (props: FormLabelProps) => {
  return <StyledFormLabel component="legend" {...props} />
}
