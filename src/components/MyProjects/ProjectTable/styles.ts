import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles((theme: Theme) => ({
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
  editButton: {
    display: 'none',
    color: '#5BC5F2',
    marginLeft: theme.spacing(1),
    '& svg': {
      color: '#5BC5F2',
      fontSize: 16
    }
  },
  smallAddButton: {
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
    margin: '1vh',
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
