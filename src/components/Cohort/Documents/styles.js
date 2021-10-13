import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  pageTitle: {
    color: '#0063AF',
    margin: '24px 0'
  },
  chartOverlay: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(2),
    padding: '0.7rem',
    backgroundColor: theme.palette.white,
    borderRadius: '8px',
    alignItems: 'center',
    fontSize: '16px'
  },
  chartTitle: {
    borderBottom: '2px inset #E6F1FD',
    paddingBottom: '10px'
  },
  tableGrid: {
    marginTop: '24px'
  },
  documentButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 5
  },
  searchBar: {
    width: '250px',
    backgroundColor: '#FFF',
    border: '1px solid #D0D7D8',
    boxShadow: '0px 1px 16px #0000000A',
    borderRadius: '20px'
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  searchButton: {
    width: '150px',
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    margin: '0 4px'
  },
  advancedSearch: {
    width: '100%',
    marginLeft: theme.spacing(1),
    flex: 1
  },
  gridAdvancedSearch: {
    width: '100%',
    backgroundColor: '#FFF',
    border: '1px solid #D0D7D8',
    boxShadow: '0px 1px 16px #0000000A',
    borderRadius: '20px'
  },
  autocomplete: {
    width: 200,
    margin: '0 16px'
  },
  filterAndSort: {
    width: 'auto'
  },
  radioGroup: {
    flexDirection: 'row',
    margin: '6px 6px 0 6px'
  },
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
  chips: {
    margin: '12px 6px',
    '&:last-child': {
      marginRight: 0
    }
  },
  loadingSpinner: {
    position: 'absolute',
    top: '50%',
    right: '50%'
  }
}))

export default useStyles
