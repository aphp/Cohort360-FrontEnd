import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
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
    overflow: 'auto',
    maxHeight: 'calc(100vh - 135px)'
  },
  inputContainer: {
    flexDirection: 'column',
    padding: '1em'
  },
  categoryTitle: {
    padding: '1em'
  },
  criteriaActionContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    borderTop: '1px solid grey',
    position: 'absolute',
    width: '100%',
    bottom: 0,
    left: 0,
    background: '#fff',
    '& > button': {
      margin: '12px 8px'
    }
  },
  durationContainer: {
    marginBottom: 20
  },
  durationTitle: {
    padding: '1em',
    display: 'flex',
    alignItems: 'center'
  },
  supportedInputsRoot: {
    '& div': {
      marginBottom: 3
    }
  }
}))

export default useStyles
