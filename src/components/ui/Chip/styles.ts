import { Chip, styled } from '@mui/material'

type CustomProps = {
  colorString?: string
  backgroundColor?: string
}

export const ChipWrapper = styled(Chip)<CustomProps>(({ colorString = '#153D8A', backgroundColor = '#D4DEE9' }) => ({
  color: colorString,
  backgroundColor: backgroundColor,
  fontSize: 12,
  margin: 2
}))
