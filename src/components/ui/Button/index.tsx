import React, { ReactNode } from 'react'

import { ButtonWrapper } from './style'

type ButtonProps = {
  children: ReactNode
  width?: string
  icon?: ReactNode
  color?: 'primary' | 'inherit' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
  variant?: 'contained' | 'text' | 'outlined'
  disabled?: boolean
  onClick: () => void
  endIcon?: ReactNode
  clearVariant?: boolean
}

const Button = ({
  children,
  icon,
  width = '100%',
  disabled = false,
  color = 'primary',
  variant = 'contained',
  onClick,
  endIcon,
  clearVariant
}: ButtonProps) => {
  return (
    <ButtonWrapper
      id="DTTB_btn"
      width={width}
      variant={variant}
      color={color}
      disableElevation
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      startIcon={icon}
      endIcon={endIcon}
      disabled={disabled}
      clearVariant={clearVariant}
    >
      {children}
    </ButtonWrapper>
  )
}

export default Button
