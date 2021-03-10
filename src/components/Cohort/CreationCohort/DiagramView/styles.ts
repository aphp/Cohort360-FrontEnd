import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    width: 'calc(100% - 300px)',
    height: 'calc(100vh - 73px)',
    padding: '24px 26px',
    paddingBottom: 76,
    overflow: 'auto',
    marginRight: 300
  },
  populationContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  }
}))

export default useStyles
