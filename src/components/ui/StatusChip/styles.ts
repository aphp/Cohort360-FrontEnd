import { Chip, styled } from '@mui/material'
import { ChipStatus, ChipStatusColors } from '.'

type CustomProps = {
  status?: ChipStatus
}

export const ChipWrapper = styled(Chip)<CustomProps>(({ status = ChipStatus.VALID }) => ({
  fontSize: 11,
  backgroundColor: ChipStatusColors[status] ?? '#D0D7D8',
  color: '#FFF',
  fontWeight: 'bold'
}))
