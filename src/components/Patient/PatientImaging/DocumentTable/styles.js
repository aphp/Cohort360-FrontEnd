import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650
  },
  tableHead: {
    height: 42,
    backgroundColor: '#D1E2F4',
    textTransform: 'uppercase'
  },
  tableHeadCell: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0063AF',
    padding: '0 20px'
  },
  tableBodyRows: {
    height: '80px',
    '&:nth-of-type(even)': {
      backgroundColor: '#FAF9F9'
    }
  },
  description: {
    fontWeight: 'bold'
  },
  validChip: {
    fontSize: '11px',
    backgroundColor: '#5BC5F2',
    width: 75,
    color: '#FFF',
    fontWeight: 'bold'
  },
  cancelledChip: {
    fontSize: '11px',
    backgroundColor: '#D0D7D8',
    width: 75,
    color: '#FFF',
    fontWeight: 'bold'
  },
  saveButton: {
    flexDirection: 'column',
    padding: theme.spacing(1)
  },
  root: {
    padding: '2px 4px',
    alignItems: 'center',
    textAlign: 'right',
    width: 300
  }
}))

export default useStyles
