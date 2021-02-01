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
    display: 'flex',
    alignItems: 'center',
    background: '#DAF0BF',
    color: '#45505B'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  criteriaType: {
    color: '#5BC5F2',
    textDecoration: 'underline',
    fontWeight: 'bold'
  },
  label: {
    fontWeight: 'bold'
  },
  addButton: {
    width: 42,
    height: 42,
    minWidth: 42,
    maxWidth: 42,
    minHeight: 42,
    maxHeight: 42,
    borderRadius: 42
  },
  loading: {
    background: 'white',
    width: 42,
    height: 42,
    minWidth: 42,
    maxWidth: 42,
    minHeight: 42,
    maxHeight: 42,
    borderRadius: 42
  }
}))

export default useStyles
