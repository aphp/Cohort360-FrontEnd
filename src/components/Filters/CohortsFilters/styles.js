import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  dialog: {
    width: '600px'
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
  filter: {
    marginBottom: '24px'
  },
  autocomplete: {
    marginTop: '16px'
  },
  datePickers: {
    margin: '1em 0 1em 1em'
  },
  label: {
    width: 'auto',
    marginRight: 8
  },
  patientsLabel: {
    width: 'auto',
    marginLeft: 8
  },
  error: {
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
