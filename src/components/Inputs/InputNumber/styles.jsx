import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  formControl: { margin: '1em' },
  inputText: {
    border: '1px solid #D7DAE3',
    borderRadius: '20px',
    padding: '0.5em',
    '& > input[type=number]::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none'
    },
    '& > input[type=number]::-webkit-outer-spin-button': {
      '-webkit-appearance': 'none'
    },
    '& > input[type=number]': {
      '-moz-appearance': 'textfield'
    }
  },
  inputTextError: {
    borderColor: '#c61137',
    color: '#fc1847'
  },
  errorMessage: {
    margin: '4px 0',
    color: '#fc1847'
  }
}))

export default useStyles
