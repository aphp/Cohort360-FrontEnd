import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(() => ({
  pagination: {
    marginTop: 10,
    float: 'right'
  },
  title: {
    fontSize: '18px',
    fontFamily: "'Montserrat', sans-serif",
    color: '#0063AF',
    textTransform: 'none',
    lineHeight: 2
  },
  dialogContent: {
    minWidth: 650
  },
  loading: {
    position: 'absolute',
    left: '50%'
  }
}))

export default useStyles
