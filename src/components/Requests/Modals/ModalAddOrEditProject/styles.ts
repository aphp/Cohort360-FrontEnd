import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  deleteButton: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    color: '#dc3545'
  }
}))

export default useStyles
