import { Tab, Tabs } from '@mui/material'
import { styled } from '@mui/material/styles'

export type TabVariant = 'pink' | 'blue' | 'pill'

type TabsCustomProps = {
  _variant: TabVariant
}

type TabCustomProps = {
  width: string
  variant: TabVariant
}

export const TabsWrapper = styled(Tabs)<TabsCustomProps>(({ _variant }) => ({
  minHeight: 32,
  borderRadius: 8,
  ...(_variant !== 'pill' && {
    '.MuiTabs-indicator': {
      backgroundColor: '#ED6D91',
      height: '4px'
    }
  }),
  ...(_variant === 'pill' && {
    width: '100%',
    '.MuiTabs-indicator': { bottom: undefined, visibility: 'hidden' },
    '.MuiTabs-flexContainer': { justifyContent: 'space-between' }
  })
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
  }),
  ...(variant === 'pill' && {
    position: 'relative',
    borderRadius: '30px',
    textAlign: 'center',
    padding: '10px 15px',
    color: '#232E6A',
    height: 'auto',
    float: 'none',
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '16px',
    fontWeight: '900',
    textTransform: 'uppercase',
    [`&.Mui-selected, &:hover`]: {
      backgroundColor: '#FFF',
      color: 'inherit',
      padding: '16px 0'
    }
  })
}))
