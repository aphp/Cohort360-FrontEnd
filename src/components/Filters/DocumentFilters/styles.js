import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  dialog: {
    width: '500px'
  },
  autocomplete: {
    marginTop: '16px'
  },
  datePickers: {
    margin: '1em 0 1em 1em'
  },
  dateError: {
    color: '#f44336'
  }
}))

export default useStyles
