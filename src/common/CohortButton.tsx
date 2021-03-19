import { Button, withStyles } from '@material-ui/core'

export default withStyles((theme) => ({
  root: {
    backgroundColor: '#252E65',
    borderRadius: '25px',
    paddingInline: theme.spacing(3),
    color: '#FFF',
    '&:hover': {
      backgroundColor: '#4355b7',
      color: '#FFF'
    }
  },
  disabled: {
    backgroundColor: theme.palette.grey[300]
  }
}))(Button)
