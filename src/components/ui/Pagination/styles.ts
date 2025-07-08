import { Grid, IconButton, Pagination, styled } from '@mui/material'
import { NumberInput } from '../NumberInput'

export const StyledPagination = styled(Pagination)(() => ({
  margin: '12px 10px',
  float: 'right',
  '& button': {
    backgroundColor: '#fff',
    color: '#5BC5F2'
  },
  '& .MuiPaginationItem-page.Mui-selected': {
    color: '#fff',
    backgroundColor: '#5BC5F2'
  },
  '& .MuiPagination-ul': {
    flexWrap: 'nowrap'
  }
}))

export const PaginationInput = styled(NumberInput)(() => ({
  width: 50,
  height: 24,
  margin: '0 4px',
  backgroundColor: '#FFF',
  border: `1px solid #5BC5F2`,
  borderRadius: 10,
  padding: 4
}))

export const StyledButton = styled(IconButton)(() => ({
  color: '#5BC5F2',
  padding: 0
}))

export const StickyContainer = styled(Grid)<{ leftPadding?: number; sidebarDisplay?: boolean }>(
  ({ theme, leftPadding = 0, sidebarDisplay }) => ({
    position: sidebarDisplay ? 'sticky' : 'fixed',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: '100%',
    zIndex: 10,
    padding: 0,
    paddingLeft: sidebarDisplay ? 'unset' : leftPadding,
    transition: theme.transitions.create('padding-left', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
)
