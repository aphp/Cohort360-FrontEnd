import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles((theme: Theme) => ({
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
