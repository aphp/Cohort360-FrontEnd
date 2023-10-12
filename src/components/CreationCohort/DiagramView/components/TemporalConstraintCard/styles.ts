import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    height: 42,
    marginLeft: 12,
    padding: '4px 8px',
    borderRadius: 4,
    [theme.breakpoints.down('lg')]: {
      alignSelf: 'flex-end'
    }
  }
}))

export default useStyles
