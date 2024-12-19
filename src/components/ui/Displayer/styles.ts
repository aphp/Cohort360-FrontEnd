import { Grid, styled } from '@mui/material'

type DisplayerProps = {
  isDisplayed: boolean
}

export const Displayer = styled(Grid)<DisplayerProps>(({ isDisplayed }) => ({
  display: isDisplayed ? 'block' : 'none'
}))
