import React from 'react'
import { Alert, styled } from '@mui/material'
import WarningIcon from 'assets/icones/warning.svg?react'
import InfoIcon from '@mui/icons-material/Info'
import ErrorIcon from '@mui/icons-material/Error'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { AlertProps } from '@mui/material/Alert'

const AlertWrapper = styled(Alert)(({ severity }) => {
  const baseStyle = {
    width: '100%',
    fontSize: 13,
    padding: '0 16px',
    fontWeight: 600,
    borderRadius: 16,
    alignItems: 'center'
  }

  const severityStyles = {
    warning: {
      backgroundColor: '#FFF5EB',
      color: '#F39634',
      border: '2px solid #FDDDBF'
    },
    info: {
      backgroundColor: '#EDF6FD',
      color: '#175782',
      border: '2px solid #B6D9F4'
    },
    error: {
      backgroundColor: '#FDEBEC',
      color: '#D5393E',
      border: '2px solid #F4B4B7'
    },
    success: {
      backgroundColor: '#EBF8F2',
      color: '#1F8A70',
      border: '2px solid #A7E0C4'
    }
  }

  return {
    ...baseStyle,
    ...(severity ? severityStyles[severity] : severityStyles.warning)
  }
})

const CustomAlert = ({ severity = 'warning', icon, ...props }: AlertProps) => {
  const defaultIcons = {
    warning: <WarningIcon />,
    info: <InfoIcon />,
    error: <ErrorIcon />,
    success: <CheckCircleIcon />
  }

  return <AlertWrapper severity={severity} icon={icon ?? defaultIcons[severity]} {...props} />
}

export default CustomAlert
