import { Chip, styled } from '@mui/material'

type CustomProps = {
  colorString?: string
  backgroundColor?: string
  customVariant?: 'filters'
}

export const ChipWrapper = styled(Chip)<CustomProps>(
  ({ colorString = '#153D8A', backgroundColor = '#D4DEE9', customVariant }) => ({
    color: colorString,
    backgroundColor: backgroundColor,
    fontSize: 12,
    margin: 2,
    ...(customVariant === 'filters' && {
      color: '#153D8A',
      backgroundColor: '#F8F9FA',
      '& .MuiChip-deleteIcon': {
        color: '#BDC9DD'
      }
    })
  })
)
