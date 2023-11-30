import { Grid, styled } from '@mui/material'

type CustomProps = {
  padding?: string | number
  margin?: string | number
}

export const BlockWrapper = styled(Grid)<CustomProps>(({ padding = 0, margin = 0 }) => ({
  padding: typeof padding === 'string' ? padding : `${padding}px`,
  margin: typeof margin === 'string' ? margin : `${margin}px`
}))

export const InputWrapper = styled('div')(() => ({
  padding: 0,
  '& > div': {
    margin: '15px 0px'
  }
}))
