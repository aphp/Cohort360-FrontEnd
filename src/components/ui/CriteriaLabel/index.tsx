import React from 'react'
import { StyledFormLabel } from './styles'
import { FormLabelProps, Tooltip } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'

type StyledFormLabelProps = FormLabelProps & {
  label: string
  infoIcon?: React.ReactNode
}

export const CriteriaLabel = (props: StyledFormLabelProps) => {
  const { infoIcon, label } = props
  return (
    <StyledFormLabel component="legend" {...props}>
      {label}
      {!!infoIcon && (
        <Tooltip title={infoIcon}>
          <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
        </Tooltip>
      )}
    </StyledFormLabel>
  )
}
