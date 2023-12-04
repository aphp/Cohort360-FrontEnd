import { Grid, styled } from '@mui/material'

export const SearchbarWithCheckWrapper = styled(Grid)(() => ({
  margin: '0px !important',
  '& > div': {
    borderRadius: 5,
    minHeight: 50,
    padding: '10px 0px'
  }
}))
