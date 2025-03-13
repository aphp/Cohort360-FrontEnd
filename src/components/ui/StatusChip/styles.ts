import { Chip, styled } from '@mui/material'
import { Status, StatusColors } from '.'

type CustomProps = {
  status?: Status
}

export const ChipWrapper = styled(Chip)<CustomProps>(({ status = Status.VALID }) => ({
  fontSize: 11,
  backgroundColor: StatusColors[status] ?? '#D0D7D8',
  color: '#FFF',
  fontWeight: 'bold',
  width: 95,
  height: 30
}))
