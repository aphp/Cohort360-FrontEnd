import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  formControl: { margin: '1em' },
  inputContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  dayInput: {
    width: 75,
    margin: 0
  },
  monthInput: {
    flex: 1,
    margin: '0 1em',
    '& fieldset': {
      borderRadius: 20,
      border: '1px solid #d7dae3 !important'
    }
  },
  monthInputRoot: {
    height: 45,
    padding: '5px !important'
  },
  yearInput: {
    width: 150,
    margin: 0
  },
  inputText: {
    border: '1px solid #D7DAE3',
    borderRadius: '20px',
    padding: '0.5em',
    '& > input[type=number]::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none'
    },
    '& > input[type=number]::-webkit-outer-spin-button': {
      '-webkit-appearance': 'none'
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
