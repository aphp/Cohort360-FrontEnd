import { Tab, Tabs } from '@mui/material'
import { styled } from '@mui/material/styles'

type CustomProps = {
  width: string
}

export const TabsWrapper = styled(Tabs)(() => ({
  minHeight: 32,
  borderRadius: 8,
  '.MuiTabs-indicator': {
    backgroundColor: '#ED6D91',
    height: '4px'
  }
}))

export const TabWrapper = styled(Tab)<CustomProps>(({ width }) => ({
  color: '#FFF',
  backgroundColor: '#153D8A',
  padding: '0px 6px',
  fontWeight: 600,
  fontSize: 13,
  width: width,
  '&.Mui-selected': {
    backgroundColor: '#0063AF',
    color: '#FFF',
    fontWeight: 900,
    fontSize: 12
  }
}))
