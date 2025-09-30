import { Grid, styled } from '@mui/material'

type ExtendedWrapperProps = {
  isExtended: boolean
}

export const CriteriaWrapper = styled(Grid)(() => ({
  borderRadius: 4,
  padding: 8,
  minWidth: 400,
  maxWidth: 930,
  position: 'relative',
  '&::before': {
    width: 38,
    height: 4,
    content: "''",
    position: 'absolute',
    background: '#19235A',
    marginLeft: -46
  }
}))

export const ExtendedWrapper = styled(Grid)<ExtendedWrapperProps>(({ theme, isExtended }) => ({
  overflow: 'hidden',
  height: isExtended ? '100%' : 42,
  [theme.breakpoints.down('xl')]: {
    order: 2
  }
}))
