import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(() => ({
  title: {
    fontSize: '18px',
    fontFamily: "'Montserrat', sans-serif",
    color: '#0063AF',
    textTransform: 'none',
    lineHeight: 2
  },
  deleteButton: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    color: '#dc3545'
  }
}))

export default useStyles
