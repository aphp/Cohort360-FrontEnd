import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  chartOverlay: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(2),
    padding: '0.7rem',
    backgroundColor: theme.palette.white,
    height: '300px',
    width: '100%',
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
  tableButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 5
  },
  searchBar: {
    minWidth: 250,
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
    height: 41,
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    marginLeft: 8
  },
  select: {
    marginRight: '4px'
  }
}))

export default useStyles
