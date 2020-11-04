import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650
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
  tableBodyRows: {
    height: '80px',
    '&:nth-of-type(even)': {
      backgroundColor: '#f4F2F2'
    }
  },
  status: {
    fontSize: '12px',
    fontWeight: 'bold'
  },
  pointerHover: {
    '&:hover': {
      cursor: 'pointer'
    }
  }
}))

export default useStyles
