import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  waitingDialog: {
    position: 'absolute',
    top: 50
  },
  waitingProgress: {
    margin: '10%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: 30
  }
}))

export default useStyles
