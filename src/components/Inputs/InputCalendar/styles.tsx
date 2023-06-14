import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  dateLabel: {
    width: 'auto',
    marginRight: 8
  },
  clearDate: {
    padding: 0,
    minWidth: 34,
    width: 34,
    maxWidth: 34
  }
}))

export default useStyles
