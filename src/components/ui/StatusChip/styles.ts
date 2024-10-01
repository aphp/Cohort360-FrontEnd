import { Chip, styled } from '@mui/material'
import { Status } from '.'

type CustomProps = {
  status?: Status
}

export const ChipWrapper = styled(Chip)<CustomProps>(({ status = Status.VALID }) => ({
  fontSize: 11,
  backgroundColor: status === Status.VALID ? '#5BC5F2' : '#D0D7D8',
  color: '#FFF',
  fontWeight: 'bold',
  width: 95,
  height: 30
}))
