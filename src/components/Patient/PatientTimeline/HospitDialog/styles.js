import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles(() => ({
  pagination: {
    marginTop: 10,
    float: 'right'
  },
  dialogContent: {
    minWidth: 650
  },
  loading: {
    position: 'absolute',
    left: '50%'
  }
}))

export default useStyles
