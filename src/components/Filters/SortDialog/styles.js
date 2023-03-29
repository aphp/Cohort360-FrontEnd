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
    width: 200,
    margin: '0 16px'
  },
  orderBy: {
    display: 'flex',
    alignItems: 'center'
  },
  radioGroup: {
    flexDirection: 'row',
    margin: '6px 6px 0 6px'
  }
}))

export default useStyles
