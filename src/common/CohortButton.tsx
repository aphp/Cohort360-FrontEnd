import { Button, withStyles } from '@material-ui/core'

export default withStyles({
  root: {
    backgroundColor: '#252E65',
    borderRadius: '25px',
    color: '#FFF',
    '&:hover': {
      backgroundColor: '#4355b7'
    }
  }
})(Button)
