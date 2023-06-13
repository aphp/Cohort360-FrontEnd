import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  root: {
    width: 'calc(100% - 220px) !important',
    height: '100% !important',
    marginRight: 220,
    zIndex: 0
  }
}))

export default useStyles
