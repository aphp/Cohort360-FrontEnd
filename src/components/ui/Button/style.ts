import { Button, styled } from '@mui/material'

type CustomProps = {
  width: string
  clearVariant?: boolean
}

export const ButtonWrapper = styled(Button)<CustomProps>(({ width, clearVariant }) => ({
  width: width,
  height: 30,
  borderRadius: 25,
  ...(clearVariant && {
    width: 'fit-content',
    color: '#153d8a',
    fontSize: 12,
    backgroundColor: '#FFF',
    border: '1px solid #153D8A',
    '&:hover': {
      backgroundColor: 'inherit'
    },
    '&.Mui-disabled': {
      backgroundColor: '#FFF',
      borderColor: 'rgba(0,0,0,0.26)'
    }
  })
}))
