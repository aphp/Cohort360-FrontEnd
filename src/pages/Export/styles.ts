import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  newExportButton: {
    backgroundColor: '#5BC5F2',
    borderRadius: 25,
    border: 'none',
    color: '#FFF',
    padding: '2px 15px',
    '&:hover': {
      backgroundColor: '#499cbf'
    }
  },
  filterButton: {
    backgroundColor: '#5BC5F2',
    borderRadius: 25,
    padding: '2px 8px',
    border: 'none',
    color: '#FFF',
    width: '20%',
    '&:hover': {
      backgroundColor: '#499cbf'
    }
  }
}))

export default useStyles
