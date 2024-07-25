import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  inputContainer: {
    padding: '1em',
    display: 'flex',
    flex: '1 1 0%',
    flexDirection: 'column'
  },
  inputItem: {
    margin: '1em',
    width: 'calc(100% - 2em)'
  }
}))

export default useStyles
