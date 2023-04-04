import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(() => ({
  tooltip: {
    position: 'absolute',
    textAlign: 'center',
    padding: '4px',
    background: '#FFFFFF',
    color: '#313639',
    border: '2px solid #313639',
    pointerEvents: 'none',
    fontSize: '1rem'
  }
}))

export default useStyles
