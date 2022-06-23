import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
  title: {
    color: '#153d8a'
  },
  validateButton: {
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    marginLeft: theme.spacing(2),
    '&:hover': {
      backgroundColor: '#499cbf'
    }
  }
}))

export default useStyles
