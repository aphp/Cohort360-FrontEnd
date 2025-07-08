import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles()((theme: Theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    borderRadius: 8,
    boxShadow: 'unset',
    border: '1px solid #D1E2F4'
  },
  pt3: {
    paddingTop: theme.spacing(1.5)
  },
  newsGrid: {
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column-reverse'
    }
  }
}))

export default useStyles
