import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  tableGrid: {
    marginTop: '24px'
  },
  documentButtons: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  searchButton: {
    minWidth: 150,
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    marginRight: 8
  },
  filterAndSort: {
    width: 'auto'
  }
}))

export default useStyles
