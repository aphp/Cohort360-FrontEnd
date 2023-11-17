import { Chip, styled } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

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

export const useStyles = makeStyles()(() => ({
  chips: {
    margin: '12px 6px',
    '&:last-child': {
      marginRight: 0
    }
  }
}))
