import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    width: 'calc(100% - 300px)',
    height: '100vh',
    padding: '24px 26px',
    paddingBottom: 76,
    overflow: 'auto',
    marginRight: 300
  },
  populationContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap',
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column',
      flexWrap: 'nowrap'
    }
  }
}))

export default useStyles
