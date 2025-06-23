import { styled } from '@mui/material/styles'
import { Tabs } from '@mui/material'

type TabVariant = 'main' | 'secondary'

type TabsCustomProps = {
  customVariant?: TabVariant
}

export const TabsWrapper = styled(Tabs)<TabsCustomProps>(({ customVariant = 'main' }) => ({
  ...(customVariant === 'main' && {
    '.MuiTabs-indicator': {
      height: 0,
      opacity: 0
    },
    '& .MuiTabScrollButton-root.Mui-disabled': {
      width: 0
    },
    '& .MuiTab-root': {
      padding: '8px 20px',
      fontWeight: 700,
      color: '#153D8A',
      fontSize: 14,
      textTransform: 'uppercase',
      '&:last-child': {
        marginRight: 0
      },
      '&:hover': {
        backgroundColor: '#FFF',
        borderBottomWidth: '3px',
        borderColor: '#153D8A',
        borderStyle: 'solid',
        color: '#153D8A'
      },
      '&.Mui-selected': {
        backgroundColor: '#153D8A',
        color: '#FFF'
      }
    },
    [`&.MuiTabRoot &.Mui-selected &:hover`]: {
      color: '#FFF'
    }
  }),
  ...(customVariant === 'secondary' && {
    '& .MuiTab-root': {
      padding: '8px 20px',
      fontWeight: 600,
      color: '#7b7b7b',
      fontSize: 14,
      '&:hover': {
        backgroundColor: '#FFF',
        borderBottomWidth: '2px',
        borderColor: '#153D8A',
        borderStyle: 'solid',
        color: '#2b2b2b'
      },
      '&.Mui-selected': {
        color: '#2b2b2b'
      }
    },
    [`&.MuiTabRoot &.Mui-selected &:hover`]: {
      color: '#FFF'
    }
  })
}))
