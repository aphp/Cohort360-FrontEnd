import { Chip, styled } from '@mui/material'

type CustomProps = {
  alive?: boolean
}

export const ChipWrapper = styled(Chip)<CustomProps>(({ alive }) => ({
  fontSize: 11,
  backgroundColor: alive ? '#5BC5F2' : '#D0D7D8',
  color: '#FFF',
  fontWeight: 'bold'
}))
