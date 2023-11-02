import { styled } from '@mui/material'

type CustomProps = {
  width: string
}

export const ButtonWrapper = styled('div')<CustomProps>(({ width, color }) => ({
  width: width,
  height: 30,
  '& button': {
    width: '100%',
    height: 'inherit',
    backgroundColor: color,
    color: 'white',
    borderRadius: 25,
    '&:hover': {
      backgroundColor: 'white',
      color: color,
      '& svg': {
        fill: color
      }
    }
  }
}))
