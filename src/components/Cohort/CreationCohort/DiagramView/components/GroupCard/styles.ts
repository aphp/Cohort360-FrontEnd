import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  buttonContainer: {
    '&::before': {
      content: '""',
      width: 2.1,
      height: 36,
      background: '#D0D7D8',
      display: 'block',
      margin: '0 auto'
    }
  },
  lastCardItem: {},
  mainCard: {
    width: 450
  },
  card: {
    width: '90%',
    margin: '0px auto'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
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
  listItem: {},
  listTitle: {},
  listDesc: {},
  groupListItem: {},
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
