import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  iconSize: {
    fontSize: '30px'
  },
  iconMargin: {
    margin: `0 ${theme.spacing(1)}px`
  },
  validChip: {
    fontSize: '11px',
    backgroundColor: '#5BC5F2',
    width: 95,
    height: 20,
    color: '#FFF',
    fontWeight: 'bold'
  },
  cancelledChip: {
    fontSize: '11px',
    backgroundColor: '#D0D7D8',
    width: 95,
    height: 20,
    color: '#FFF',
    fontWeight: 'bold'
  },
  textGrid: {
    marginLeft: '16px'
  },
  searchIcon: {
    padding: 0,
    marginLeft: 4
  },
  row: {
    borderBottom: '1px solid rgba(224,224,224,1)',
    padding: '10px'
  },
  loadingSpinner: {
    position: 'absolute',
    top: '50%',
    right: '50%'
  },
  loadingDialog: {
    position: 'absolute',
    left: '50%'
  },
  dialogContent: {
    minWidth: 650,
    minHeight: 45
  },
  tableHead: {
    height: 42,
    backgroundColor: '#D1E2F4',
    textTransform: 'uppercase'
  },
  tableHeadCell: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#0063AF',
    padding: '0 20px',
    textTransform: 'uppercase'
  }
}))

export default useStyles
