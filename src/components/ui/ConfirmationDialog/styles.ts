import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  warningIcon: {
    fontSize: 40,
    color: '#FF9800',
    margin: 12
  }
}))

export default useStyles
