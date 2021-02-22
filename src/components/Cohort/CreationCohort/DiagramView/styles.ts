import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    width: 'calc(100% - 280px)',
    height: 'calc(100vh - 73px)',
    justifyContent: 'space-around',
    marginRight: 280,
    padding: '50px 0',
    overflow: 'auto'
  }
}))

export default useStyles
