import { Breadcrumbs, styled } from '@mui/material'

export const StyledBreadcrumbs = styled(Breadcrumbs)({
  '& .MuiTypography-root': {
    color: '#2b2b2b',
    fontSize: 14,
    fontWeight: 600
  },
  '& .MuiLink-root': {
    color: '#71717A',
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': {
      color: '#2b2b2b'
    }
  }
})
