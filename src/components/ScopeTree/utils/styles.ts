import { makeStyles } from 'tss-react/mui'

export default makeStyles()(() => ({
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
