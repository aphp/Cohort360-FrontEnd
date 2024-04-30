import React, { PropsWithChildren } from 'react'
import { ButtonProps, Button as MuiButton } from '@mui/material'

/**
 * Primary UI component for user interaction
 */
export const Button: React.FC<PropsWithChildren<ButtonProps>> = ({
  children,
  ...props
}: PropsWithChildren<ButtonProps>) => {
  return <MuiButton {...props}>{children}</MuiButton>
}

/*

export const Button = styled(CustomButton)<PropsWithChildren<ButtonProps>>((props: PropsWithChildren<ButtonProps>) => ({

  \/\* override CSS properties here \*\/

}))

*/
