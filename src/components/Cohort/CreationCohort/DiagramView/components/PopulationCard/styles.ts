import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    width: 450,
    height: 'fit-content',
    minHeight: 180
  },
  cardHeader: {
    background: '#D1E2F4',
    color: '#45505B'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
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
    width: '50%',
    margin: 4,
    outline: 'none'
  }
}))

export default useStyles
