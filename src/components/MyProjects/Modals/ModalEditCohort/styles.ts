import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles(() => ({
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
