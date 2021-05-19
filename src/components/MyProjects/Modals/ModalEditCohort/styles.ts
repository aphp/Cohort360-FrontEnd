import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  title: {
    ' & h2': {
      fontSize: '18px',
      fontFamily: "'Montserrat', sans-serif",
      color: '#0063AF',
      textTransform: 'none',
      lineHeight: 2
    }
  },
  inputContainer: {
    marginBottom: '24px'
  },
  deleteButton: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    color: '#dc3545'
  }
}))

export default useStyles
