import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  dialog: {
    width: '400px'
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
  slider: {
    marginTop: '40px'
  },
  inputItem: {
    margin: '1em',
    width: 'calc(100% - 2em)'
  }
}))

export default useStyles
