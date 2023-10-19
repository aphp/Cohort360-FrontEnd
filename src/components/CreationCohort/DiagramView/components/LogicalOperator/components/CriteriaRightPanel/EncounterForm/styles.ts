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
  inputItem: {
    margin: '1em',
    width: 'calc(100% - 2em)'
  },
  durationLegend: {
    color: '#153D8A',
    fontWeight: 600,
    fontSize: 12,
    paddingBottom: 10
  }
}))

export default useStyles
