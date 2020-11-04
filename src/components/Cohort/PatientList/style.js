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
    height: '300px',
    width: '342px',
    borderRadius: '8px',
    alignItems: 'center',
    fontSize: '16px'
  },
  chartTitle: {
    borderBottom: '2px inset #E6F1FD',
    paddingBottom: '10px'
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
  tableGrid: {
    marginTop: '24px'
  },
  tableButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 5
  },
  searchBar: {
    width: '180px',
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
    width: '125px',
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    marginLeft: 20
  },
  select: {
    marginRight: '4px'
  }
}))

export default useStyles
