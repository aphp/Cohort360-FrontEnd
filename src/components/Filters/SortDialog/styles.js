import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  dialog: {
    width: '600px'
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
