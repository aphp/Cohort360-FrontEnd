import React from 'react'
import { ButtonOwnProps } from '@mui/material'

import { ButtonWrapper } from './style'

type ButtonProps = ButtonOwnProps & {
  clearVariant?: boolean
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  width?: string
}

const Button = ({
  children,
  clearVariant,
  color,
  disabled,
  endIcon,
  startIcon,
  onClick,
  variant = 'contained',
  width = '100%'
}: ButtonProps) => {
  return (
    <ButtonWrapper
      clearVariant={clearVariant}
      color={color}
      disabled={disabled}
      disableElevation
      endIcon={endIcon}
      id="DTTB_btn"
      onClick={onClick}
      startIcon={startIcon}
      variant={variant}
      width={width}
    >
      {children}
    </ButtonWrapper>
  )
}

export default Button
