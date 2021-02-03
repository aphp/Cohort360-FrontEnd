import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    '&::after': {
      content: '""',
      width: 2,
      height: 36,
      background: '#D0D7D8',
      display: 'block',
      margin: '0 auto'
    }
  },
  card: {
    width: 450
  },
  cardHeader: {
    background: '#D1E2F4',
    color: '#45505B'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100% - 53px)'
  },
  populationLabel: {
    color: '#5BC5F2',
    textDecoration: 'underline',
    fontWeight: 'bold'
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
