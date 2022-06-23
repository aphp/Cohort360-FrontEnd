import { makeStyles } from '@mui/styles'

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
  }
}))

export default useStyles
