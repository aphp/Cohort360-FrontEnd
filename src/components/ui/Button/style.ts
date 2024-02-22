import { Button, styled } from '@mui/material'

type CustomProps = {
  width: string
}

export const ButtonWrapper = styled(Button)<CustomProps>(({ width }) => ({
  width: width,
  height: 30,
  borderRadius: 25
}))
