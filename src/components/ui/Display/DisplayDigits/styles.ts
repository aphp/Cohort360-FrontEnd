import { styled } from '@mui/material'

type CustomProps = {
  color: string
}

export const DisplayDigitsWrapper = styled('div')<CustomProps>(({ color }) => ({
  display: 'flex',
  color: color
}))
