import { Chip, styled } from '@mui/material'
import { ChipStatus, ChipStatusColors, ChipStatusContentColors } from '.'

type CustomProps = {
  status?: ChipStatus
}

export const ChipWrapper = styled(Chip)<CustomProps>(({ status = ChipStatus.VALID }) => ({
  fontSize: 11,
  fontWeight: 'bold',
  backgroundColor: ChipStatusColors[status] ?? '#D0D7D8',
  color: ChipStatusContentColors[status] ?? '#FFF',
  '& svg': {
    fill: ChipStatusContentColors[status] ?? '#FFF'
  }
}))
