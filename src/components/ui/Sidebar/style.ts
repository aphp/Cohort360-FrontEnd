import { styled } from '@mui/material/styles'
import { Drawer } from '@mui/material'

export const SidebarWrapper = styled(Drawer)(() => ({
  '& .MuiPaper-root': {
    width: 400
  },
  '& > div': {
    padding: '10px 10px 0px 10px'
  }
}))

export const SidebarButton = styled('div')(() => ({
  backgroundColor: '#FFF',
  width: 30,
  height: 101,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0px 3px 6px #0000000A',
  borderRadius: '2px 0px 0px 2px',
  top: 72,
  right: 0,
  position: 'fixed',
  cursor: 'pointer'
}))
