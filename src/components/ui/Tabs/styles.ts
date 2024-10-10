import { Tab, Tabs } from '@mui/material'
import { styled } from '@mui/material/styles'

type TabsCustomProps = {
  color: string
}

type TabCustomProps = {
  width: string
  color: string
}

export const TabsWrapper = styled(Tabs)<TabsCustomProps>(({ color }) => ({
  minHeight: 32,
  borderRadius: 8,
  '.MuiTabs-indicator': {
    backgroundColor: color,
    height: '4px'
  }
}))

export const TabWrapper = styled(Tab)<TabCustomProps>(({ width, color }) => ({
  color: '#00000099',
  backgroundColor: 'transparent',
  padding: '0px 6px',
  fontWeight: 700,
  fontSize: 13,
  width: width,
  '&.Mui-selected': {
    backgroundColor: 'transparent',
    color: color,
    fontWeight: 900,
    fontSize: 13
  },
  '&.MuiButtonBase-root.MuiTab-root': {
    minHeight: 40
  }
}))
