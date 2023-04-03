import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles((theme: Theme) => ({
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
  iconSize: {
    fontSize: '30px'
  },
  searchIcon: {
    padding: 0,
    marginLeft: 4
  },
  iconMargin: {
    margin: `0 ${theme.spacing(1)}`
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
  },
  loadingDialog: {
    position: 'absolute',
    left: '50%'
  },
  dialogContent: {
    minWidth: 650,
    minHeight: 45
  }
}))

export default useStyles
