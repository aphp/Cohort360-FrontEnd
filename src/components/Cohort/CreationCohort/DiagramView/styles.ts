import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    width: 'calc(100% - 220px)',
    height: 'calc(100vh - 76px)',
    marginRight: 220,
    padding: '50px 0',
    overflow: 'auto'
  }
}))

export default useStyles
