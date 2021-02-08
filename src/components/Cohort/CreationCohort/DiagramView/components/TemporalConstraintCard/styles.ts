import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  card: {
    width: 450
  },
  cardHeader: {
    background: '#D1E2F4',
    color: '#45505B'
  },
  actionButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12
  },
  actionButton: {
    margin: 4,
    outline: 'none'
  }
}))

export default useStyles
