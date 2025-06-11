import { Grid, styled } from '@mui/material'

export const HiddenScrollBar = styled(Grid)(() => ({
  overflow: 'scroll',
  scrollbarWidth: 'none', // Firefox
  msOverflowStyle: 'none', // IE 10+
  '&::-webkit-scrollbar': {
    display: 'none' // Chrome, Safari, Edge (WebKit)
  }
}))
