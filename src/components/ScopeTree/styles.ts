import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  expandCell: {
    padding: '16px 4px 16px 16px'
  },
  checkbox: {
    padding: '8px 0'
  },
  tabs: {
    width: '100%'
  },
  searchBar: {
    marginBottom: '0px'
  },
  mainRow: {},
  secondRow: {
    background: '#f3f5f9'
  },
  container: {
    background: 'white'
  },
  expandIcon: {
    padding: '0 0 0 8px'
  },
  loadingSpinnerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tableHead: {
    height: 42,
    backgroundColor: '#D1E2F4',
    textTransform: 'uppercase'
  },
  tableHeadCell: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0063AF'
  },
  emptyTableHeadCell: {
    width: '42px',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0063AF',
    padding: 0
  },
  pagination: {
    float: 'right',
    '& button': {
      backgroundColor: '#fff',
      color: '#5BC5F2'
    },
    '& .MuiPaginationItem-page.Mui-selected': {
      color: '#0063AF',
      backgroundColor: '#FFF'
    },
    margin: '12px 0'
  },
  linearProgress: {
    height: '4px',
    marginTop: '2px',
    background: 'rgb(209, 226, 244)'
  }
}))

export default useStyles
