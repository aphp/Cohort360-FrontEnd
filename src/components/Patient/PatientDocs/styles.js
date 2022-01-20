import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  pagination: {
    margin: '10px 0',
    float: 'right',
    '& button': {
      backgroundColor: '#fff',
      color: '#5BC5F2'
    },
    '& .MuiPaginationItem-page.Mui-selected': {
      color: '#0063AF',
      backgroundColor: '#FFF'
    }
  },
  documentTable: {
    margin: '0 auto'
  },
  documentButtons: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  searchBar: {
    minWidth: 200,
    backgroundColor: '#FFF',
    border: '1px solid #D0D7D8',
    boxShadow: '0px 1px 16px #0000000A',
    borderRadius: '25px'
  },
  autocomplete: {
    width: 200,
    margin: '0 16px'
  },
  filterAndSort: {
    width: 'auto',
    '& > *': { marginBottom: 5 }
  },
  radioGroup: {
    flexDirection: 'row',
    margin: '6px 6px 0 6px'
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  searchButton: {
    minWidth: 150,
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    marginLeft: 8
  },
  chips: {
    margin: '12px 6px',
    '&:last-child': {
      marginRight: 0
    }
  }
}))

export default useStyles
