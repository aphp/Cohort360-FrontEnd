import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: 'calc(100% - 300px)',
    height: 'calc(100vh - 73px)',
    padding: '24px 26px',
    overflow: 'auto',
    marginRight: 300
  }
}))

export default useStyles
