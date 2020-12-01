import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  dialog: {
    width: '600px'
  },
  bold: {
    fontWeight: 'bold'
  },
  title: {
    ' & h2': {
      fontSize: '18px',
      fontFamily: "'Montserrat', sans-serif",
      color: '#0063AF',
      textTransform: 'none',
      lineHeight: 2
    }
  },
  subtitle: {
    margin: '8px 0px'
  },
  table: {
    minWidth: '650'
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
      backgroundColor: '#FAF9F9'
    },
    '&:hover': {
      cursor: 'pointer'
    }
  }
}))

export default useStyles
