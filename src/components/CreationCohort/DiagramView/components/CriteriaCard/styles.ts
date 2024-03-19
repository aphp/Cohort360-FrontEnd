import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles()((theme: Theme) => ({
  criteriaItem: {
    borderRadius: 4,
    padding: 8,
    marginTop: 12,
    minWidth: 400,
    maxWidth: 850,
    position: 'relative',
    '&::before': {
      width: 38,
      height: 4,
      content: "''",
      position: 'absolute',
      background: '#19235A',
      marginLeft: -46
    }
  },
  title: {
    marginLeft: 4
  },
  secondItem: {
    overflow: 'hidden',
    [theme.breakpoints.down('xl')]: {
      order: 2
    }
  }
}))

export default useStyles
