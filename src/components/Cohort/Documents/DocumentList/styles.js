import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  iconSize: {
    fontSize: '30px'
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
  img: {
    width: '50%',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  searchIcon: {
    padding: 0,
    marginLeft: 4
  },
  row: {
    borderBottom: '1px solid rgba(224,224,224,1)',
    padding: '10px',
    '&:nth-of-type(even)': {
      backgroundColor: '#FAF9F9'
    }
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
  }
}))

export default useStyles
