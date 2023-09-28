import { Chip, styled } from '@mui/material'
import { ChipStyles } from './StatusChip'

type CustomProps = {
  status?: ChipStyles
}

export const ChipWrapper = styled(Chip)<CustomProps>(({ status = ChipStyles.VALID }) => ({
  fontSize: 11,
  backgroundColor: status === ChipStyles.VALID ? '#5BC5F2' : '#D0D7D8',
  color: '#FFF',
  fontWeight: 'bold',
  width: 95,
  height: 30
}))
