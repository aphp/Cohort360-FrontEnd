import { styled } from '@mui/material/styles'
import { Tabs } from '@mui/material'

export const MainTabsWrapper = styled(Tabs)(() => ({
  '.MuiTabs-indicator': {
    height: 0,
    opacity: 0
  },
  '& .MuiTab-root': {
    padding: '4px 15px',
    marginRight: 12,
    minWidth: 0,
    fontWeight: 900,
    color: '#0063af',
    '&:last-child': {
      marginRight: 0
    },
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  '& .Mui-selected': {
    backgroundColor: '#fff',
    borderRadius: '50px',
    padding: '0px 25px'
  }
}))
