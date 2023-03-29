import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(() => ({
  dialog: {
    width: '600px'
  },
  title: {
    fontSize: '18px',
    fontFamily: "'Montserrat', sans-serif",
    color: '#0063AF',
    textTransform: 'none',
    lineHeight: 2
  },
  filter: {
    marginBottom: '24px'
  },
  datePickers: {
    margin: '1em 0 1em 1em'
  },
  dateLabel: {
    width: 'auto',
    marginRight: 8
  },
  dateError: {
    color: '#f44336'
  },
  clearDate: {
    padding: 0,
    minWidth: 34,
    width: 34,
    maxWidth: 34
  },
  buttonLabel: {
    display: 'inline'
  }
}))

export default useStyles
