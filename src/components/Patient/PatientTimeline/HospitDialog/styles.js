import { makeStyles } from '@mui/styles'

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
