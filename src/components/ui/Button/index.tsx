import React, { ReactNode } from 'react'

import { Button as ButtonMui } from '@mui/material'
import { ButtonWrapper } from './style'

type ButtonProps = {
  children: ReactNode
  width?: string
  icon?: ReactNode
  disabled?: boolean
  onClick: () => void
}

const Button = ({ children, icon, width = '100%', disabled = false, onClick }: ButtonProps) => {
  return (
    <ButtonWrapper id="DTTB_btn" width={width}>
      <ButtonMui variant="contained" disableElevation onClick={onClick} startIcon={icon} disabled={disabled}>
        {children}
      </ButtonMui>
    </ButtonWrapper>
  )
}

export default Button
