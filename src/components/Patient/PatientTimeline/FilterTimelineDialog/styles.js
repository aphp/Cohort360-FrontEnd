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
  autocomplete: {
    marginTop: '16px'
  },
  buttonLabel: {
    display: 'inline'
  }
}))

export default useStyles
