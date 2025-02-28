import { Chip, styled } from '@mui/material'
import { ChipStyles } from '.'

type CustomProps = {
  status?: ChipStyles
}

export const ChipWrapper = styled(Chip)<CustomProps>(({ status = ChipStyles.VALID }) => ({
  fontWeight: 'bold',
  ...((status === ChipStyles.VALID || status === ChipStyles.CANCELLED) && {
    fontSize: 11,
    height: 30,
    width: 95,
    color: '#FFF',
    backgroundColor: status === ChipStyles.VALID ? '#5BC5F2' : '#D0D7D8'
  }),
  ...((status === ChipStyles.FINISHED || status === ChipStyles.IN_PROGRESS || status === ChipStyles.ERROR) && {
    fontSize: 12,
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
  })
}))
