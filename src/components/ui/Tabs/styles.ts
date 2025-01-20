import { Tab, Tabs } from '@mui/material'
import { styled } from '@mui/material/styles'

type TabCustomProps = {
  width: string
  variant: 'pink' | 'blue'
}

export const TabsWrapper = styled(Tabs)(() => ({
  minHeight: 32,
  borderRadius: 8,
  '.MuiTabs-indicator': {
    backgroundColor: '#ED6D91',
    height: '4px'
  }
}))

export const TabWrapper = styled(Tab)<TabCustomProps>(({ width, variant }) => ({
  padding: '0px 6px',
  fontSize: 13,
  width: width,
  maxWidth: '100%',
  '&.MuiButtonBase-root.MuiTab-root': {
    minHeight: 40
  },
  '&.Mui-selected': {
    fontWeight: 900
  },
  ...(variant === 'pink' && {
    color: '#00000099',
    backgroundColor: 'transparent',
    fontWeight: 700,
    borderBottomWidth: 'thin',
    borderColor: 'rgba(0,0,0,0.12)',
    borderStyle: 'solid',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      color: '#ED6D91',
      fontSize: 13
    }
  }),
  ...(variant === 'blue' && {
    color: '#FFF',
    backgroundColor: '#153D8A',
    fontWeight: 600,
    '&.Mui-selected': {
      backgroundColor: '#0063AF',
      color: '#FFF',
      fontSize: 12
    }
  })
}))
