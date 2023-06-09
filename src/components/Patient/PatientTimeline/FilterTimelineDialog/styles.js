import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  dialog: {
    width: '600px'
  },
  autocomplete: {
    marginTop: '16px'
  },
  buttonLabel: {
    display: 'inline'
  }
}))

export default useStyles
