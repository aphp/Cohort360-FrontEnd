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
  inputItem: {
    margin: '0px 1em 0px 1em',
    width: 'calc(100% - 2em)'
  },
  textField: {
    '& input': {
      padding: '2px 4px 3px 0'
    }
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
  durationLegend: {
    color: '#5B5E63',
    fontWeight: 900,
    fontSize: 12,
    textAlign: 'center'
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
