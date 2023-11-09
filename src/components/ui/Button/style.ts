import { styled } from '@mui/material'

type CustomProps = {
  width: string
}

export const ButtonWrapper = styled('div')<CustomProps>(({ width }) => ({
  width: width,
  height: 30,
  '& button': {
    width: '100%',
    height: 'inherit',
    borderRadius: 25
  }
}))
