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
    color: '#4EAC6A',
    '& svg': {
      fill: '#4EAC6A'
    }
  }),
  ...(status === 'in-progress' && {
    backgroundColor: '#FFF4D1',
    color: '#EEBD2B',
    '& svg': {
      fill: '#EEBD2B'
    }
  }),
  ...(status === 'error' && {
    backgroundColor: '#F2B1B7',
    color: '#DC3545',
    '& svg': {
      fill: '#DC3545'
    }
  })
}))
