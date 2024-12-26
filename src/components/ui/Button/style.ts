import { Button, styled } from '@mui/material'

type CustomProps = {
  width: string
  customVariant?: 'clear' | 'pink'
  small?: boolean
}

export const ButtonWrapper = styled(Button)<CustomProps>(({ width, customVariant, small }) => ({
  width: width,
  height: 30,
  borderRadius: 25,
  ...(small && {
    fontSize: 12
  }),
  ...(customVariant === 'pink' && {
    backgroundColor: '#ED6D91',
    color: '#FFF',
    '&:hover': {
      backgroundColor: '#D85E81'
    }
  }),
  ...(customVariant === 'clear' && {
    width: 'fit-content',
    color: '#2b2b2b',
    fontSize: 12,
    backgroundColor: '#FFF',
    '&:hover': {
      backgroundColor: 'inherit',
      border: '1px solid #2B2B2B'
    },
    '&.Mui-disabled': {
      backgroundColor: '#FFF'
    }
  })
}))
