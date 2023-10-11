import { Chip, styled } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const ChipWrapper = styled(Chip)(() => ({
  fontSize: 12,
  marginRight: 6,
  marginBottom: 12,
  '&:last-child': {
    marginLeft: 0
  }
}))

export const useStyles = makeStyles()(() => ({
  chips: {
    margin: '12px 6px',
    '&:last-child': {
      marginRight: 0
    }
  }
}))
