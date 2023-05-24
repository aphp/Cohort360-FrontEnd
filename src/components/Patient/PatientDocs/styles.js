import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  documentTable: {
    margin: '0 auto'
  },
  documentButtons: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  filterAndSort: {
    width: 'auto',
    '& > *': { marginBottom: 5 }
  },
  searchButton: {
    minWidth: 150,
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    marginRight: 8
  }
}))

export default useStyles
