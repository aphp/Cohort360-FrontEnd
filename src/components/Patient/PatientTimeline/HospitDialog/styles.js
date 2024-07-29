import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  dialogContent: {
    minWidth: 650
  },
  loading: {
    position: 'absolute',
    left: '50%'
  }
}))

export default useStyles
