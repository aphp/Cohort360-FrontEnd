import React, { ReactNode } from 'react'

import { Button as ButtonMui } from '@mui/material'
import { ButtonWrapper } from './style'

type ButtonProps = {
  children: ReactNode
  width?: string
  icon?: ReactNode
  color?: 'primary' | 'inherit' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
  variant?: 'contained' | 'text' | 'outlined'
  disabled?: boolean
  onClick: () => void
}

const Button = ({
  children,
  icon,
  width = '100%',
  disabled = false,
  color = 'primary',
  variant = 'contained',
  onClick
}: ButtonProps) => {
  return (
    <ButtonWrapper id="DTTB_btn" width={width}>
      <ButtonMui
        variant={variant}
        color={color}
        disableElevation
        onClick={onClick}
        startIcon={icon}
        disabled={disabled}
      >
        {children}
      </ButtonMui>
    </ButtonWrapper>
  )
}

export default Button
