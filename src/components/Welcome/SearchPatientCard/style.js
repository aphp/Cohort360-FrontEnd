import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  quickAccessContext: {
    flex: 1
  },
  divider: {
    marginBottom: '15px'
  },
  growth: {
    marginRight: '4px'
  },
  perimeters: {
    cursor: 'pointer'
  },
  button: {
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    '&:hover': {
      backgroundColor: '#499cbf'
    },
    marginBottom: 4
  },
  link: {
    color: '#5BC5F2',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: 20,
    marginTop: 8
  }
}))

export default useStyles
