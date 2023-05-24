import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
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
