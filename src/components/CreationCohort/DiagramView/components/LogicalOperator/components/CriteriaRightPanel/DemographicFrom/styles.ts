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
    padding: '1em',
    display: 'flex',
    flex: '1 1 0%',
    flexDirection: 'column'
  },
  inputItem: {
    margin: '1em',
    width: 'calc(100% - 2em)'
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
  }
}))

export default useStyles
