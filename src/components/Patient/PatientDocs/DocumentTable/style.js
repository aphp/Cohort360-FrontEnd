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
    width: 95,
    color: '#FFF',
    fontWeight: 'bold'
  },
  cancelledChip: {
    fontSize: '11px',
    backgroundColor: '#D0D7D8',
    width: 95,
    color: '#FFF',
    fontWeight: 'bold'
  }
}))

export default useStyles
