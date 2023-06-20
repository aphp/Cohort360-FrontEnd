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
    backgroundColor: '#5BC5F2',
    color: 'white',
    borderRadius: 25,
    '&:hover': {
      backgroundColor: 'white',
      color: '#5BC5F2',
      '& svg': {
        fill: '#5BC5F2'
      }
    }
  }
}))
