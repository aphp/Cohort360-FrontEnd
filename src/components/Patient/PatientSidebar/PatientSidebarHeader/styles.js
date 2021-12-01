import { makeStyles } from '@material-ui/core/styles'

export default makeStyles((theme) => ({
  root: {
    display: 'flex',
    padding: '0 8px',
    flexDirection: 'column'
  },
  filterChipsGrid: {
    maxWidth: 325
  },
  searchBar: {
    width: '180px',
    backgroundColor: '#FFF',
    border: '1px solid #D0D7D8',
    boxShadow: '0px 1px 16px #0000000A',
    borderRadius: '25px'
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  autocomplete: {
    width: '120px'
  },
  buttons: {
    width: 'calc(50% - 16px)',
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    margin: '4px 0'
  },
  margin: {
    margin: '8px 0'
  },
  lockIcon: {
    marginRight: 8
  },
  chips: {
    margin: '6px',
    '&:last-child': {
      marginRight: 0
    }
  }
}))
