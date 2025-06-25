import React from 'react'
import { ButtonOwnProps } from '@mui/material'

import { ButtonWrapper } from './style'

type ButtonProps = ButtonOwnProps & {
  customVariant?: 'clear' | 'pink' | 'back' | 'secondary'
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  small?: boolean
  width?: string
}

const Button = ({
  children,
  color,
  disabled,
  endIcon,
  small,
  startIcon,
  onClick,
  customVariant,
  variant = 'contained',
  width = '100%'
}: ButtonProps) => {
  return (
    <ButtonWrapper
      small={small}
      color={color}
      disabled={disabled}
      disableElevation
      endIcon={endIcon}
      id="DTTB_btn"
      onClick={onClick}
      startIcon={startIcon}
      variant={variant}
      width={width}
      customVariant={customVariant}
    >
      {children}
    </ButtonWrapper>
  )
}

export default Button
