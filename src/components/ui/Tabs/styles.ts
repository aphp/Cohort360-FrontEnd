import { Tab, Tabs } from '@mui/material'
import { styled } from '@mui/material/styles'

type CustomProps = {
  width: string
}

export const TabsWrapper = styled(Tabs)(() => ({
  minHeight: 32,
  borderRadius: 8,
  '.MuiTabs-indicator': {
    backgroundColor: '#FFF',
    height: '4px'
  }
}))

export const TabWrapper = styled(Tab)<CustomProps>(({ width }) => ({
  color: '#5bc5f2',
  backgroundColor: '#fff',
  padding: '0px 16px',
  fontWeight: 600,
  fontSize: 13,
  borderBottom: '#5bc5f2 inset 4px',
  width: width,
  '&.Mui-selected': {
    backgroundColor: '#5bc5f2',
    color: '#FFF',
    fontWeight: 900,
    fontSize: 12
  }
}))
