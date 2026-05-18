import { styled } from '@mui/material/styles'
import Switch from '@mui/material/Switch'

export const PinkSwitch = styled(Switch)(() => ({
  '& .MuiSwitch-thumb': {
    backgroundColor: '#fff'
  },
  '& .MuiSwitch-track': {
    backgroundColor: '#ef4bc9 !important',
    opacity: 1
  }
}))
