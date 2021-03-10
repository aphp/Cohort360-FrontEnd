import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
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
    flexWrap: 'wrap',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      flexWrap: 'nowrap'
    }
  }
}))

export default useStyles
