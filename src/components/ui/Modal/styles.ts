import { styled } from '@mui/material'

type CustomProps = {
  width: string
}

export const DialogWrapper = styled('div')<CustomProps>(({ width }) => ({
  width: `${width} !important`
}))
