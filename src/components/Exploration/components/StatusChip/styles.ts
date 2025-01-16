import { Chip, styled } from '@mui/material'
import { StatusVariant } from '.'

type CustomProps = {
  status: StatusVariant
}

export const ChipWrapper = styled(Chip)<CustomProps>(({ status }) => ({
  fontSize: 12,
  fontWeight: 'bold',
  height: 24,
  ...(status === 'finished' && {
    backgroundColor: '#DCF4E9',
    color: '#4EAC6A'
  }),
  ...(status === 'in-progress' && {
    backgroundColor: '#FFF4D1',
    color: '#FFC107'
  }),
  ...(status === 'error' && {
    backgroundColor: '#F2B1B7',
    color: '#DC3545'
  })
}))
