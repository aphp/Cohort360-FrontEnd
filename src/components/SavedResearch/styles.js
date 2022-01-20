import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  pagination: {
    marginTop: 10,
    float: 'right',
    '& button': {
      backgroundColor: '#FFF',
      color: '#5BC5F2'
    },
    '& .MuiPaginationItem-page.Mui-selected': {
      color: '#0063AF',
      backgroundColor: '#FFF'
    }
  },
  documentTable: {
    marginTop: '24px'
  },
  tableButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 5,
    width: 'auto'
  },
  searchBar: {
    width: 250,
    maxWidth: 250,
    backgroundColor: '#FFF',
    border: '1px solid #D0D7D8',
    boxShadow: '0px 1px 16px #0000000A',
    borderRadius: '25px'
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
