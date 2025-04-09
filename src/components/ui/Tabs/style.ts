import { styled } from '@mui/material/styles'
import { Tabs } from '@mui/material'

export const MainTabsWrapper = styled(Tabs)(() => ({
  width: '100%',
  '.MuiTabs-indicator': {
    height: 0,
    opacity: 0
  },
  '& .MuiTab-root': {
    flex: 1,
    padding: '4px 15px',
    minWidth: 0,
    fontWeight: 900,
    textAlign: 'center',
    fontFamily: 'Montserrat, sans-serif',
    color: 'inherit',
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
