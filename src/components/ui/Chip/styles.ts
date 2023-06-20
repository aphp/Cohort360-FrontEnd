import { Chip, styled } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

type CustomProps = {
  color?: string
  backgroundColor?: string
}

export const ChipWrapper = styled(Chip)<CustomProps>(({ color = '#0063AF', backgroundColor = '#FFF' }) => ({
  color: color,
  backgroundColor: backgroundColor,
  fontSize: 12
}))

export const useStyles = makeStyles()(() => ({
  chips: {
    margin: '12px 6px',
    '&:last-child': {
      marginRight: 0
    }
  }
}))
