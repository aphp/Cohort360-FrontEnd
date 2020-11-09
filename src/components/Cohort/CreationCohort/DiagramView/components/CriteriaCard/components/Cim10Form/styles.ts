import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto'
  },
  actionContainer: {
    display: 'flex',
    alignItems: 'center',
    height: 72,
    padding: 20,
    backgroundColor: '#317EAA',
    color: 'white'
  },
  backButton: { color: 'white' },
  divider: { background: 'white' },
  titleLabel: { marginLeft: '1em' },
  formContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '1em'
  },
  formControl: {
    margin: '1em'
  },
  inputText: {
    border: '1px solid #D7DAE3',
    borderRadius: '5px',
    padding: '0.5em'
  },
  inputTextError: {
    borderColor: '#c61137',
    color: '#fc1847'
  },
  criteriaActionContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    borderTop: '1px solid grey',
    '& > button': {
      margin: '12px 8px'
    }
  }
}))

export default useStyles
