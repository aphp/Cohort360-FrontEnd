import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(() => ({
  title: {
    fontSize: '18px',
    fontFamily: "'Montserrat', sans-serif",
    color: '#0063AF',
    textTransform: 'none',
    lineHeight: 2
  },
  inputContainer: {
    marginBottom: '24px'
  },
  requestList: {
    border: `1px solid #ccc`,
    borderRadius: 4,
    marginTop: 8,
    maxHeight: 650,
    minHeight: 300,
    overflow: 'auto',
    padding: '4px 8px'
  },
  requestItem: {
    borderBottom: `1px solid #cccccccc`,
    cursor: 'pointer',
    '&:last-child': {
      borderBottom: 'none'
    }
  }
}))

export default useStyles
