import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  grid: {
    marginBottom: theme.spacing(2)
  },
  table: {
    '& > *': {
      borderBottom: 'unset'
    }
  },
  tableHead: {
    height: '42px',
    backgroundColor: '#D1E2F4',
    textTransform: 'uppercase'
  },
  tableHeadCell: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#0063AF',
    padding: '0 20px'
  },
  tdName: {
    '&:hover > button': {
      display: 'inline-flex'
    }
  },
  editButon: {
    display: 'none',
    color: '#5BC5F2',
    marginLeft: theme.spacing(1),
    '& svg': {
      color: '#5BC5F2',
      fontSize: 16
    }
  },
  tableBodyRows: {
    height: '80px',
    '&:nth-of-type(even)': {
      backgroundColor: '#f4F2F2'
    }
  },
  smallAddButon: {
    color: '#fff',
    backgroundColor: '#5BC5F2 !important',
    marginLeft: theme.spacing(1),
    '& svg': {
      color: '#fff',
      fontSize: 16
    }
  },
  dateCell: {
    width: 175
  },
  versionContainer: {
    padding: theme.spacing(2),
    background: '#e6f1fd66'
  },
  versionLabel: {
    background: '#0262ae',
    color: 'white !important',
    padding: '4px 12px',
    borderRadius: 12,
    height: 25,
    width: 'fit-content',
    margin: '0 auto'
  },
  addButton: {
    color: '#FFF',
    margin: 4,
    borderRadius: 25,
    backgroundColor: '#5BC5F2'
  },
  emptyRequestRow: {
    height: '10vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    textAlign: 'center'
  },
  notAllowed: { cursor: 'not-allowed' }
}))

export default useStyles
