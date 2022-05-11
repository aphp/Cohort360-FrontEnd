import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    overflow: 'auto'
  },
  actionContainer: {
    display: 'flex',
    alignItems: 'center',
    height: 72,
    padding: 20,
    backgroundColor: '#317EAA',
    color: 'white',
    // Not default
    marginBottom: 48
  },
  backButton: { color: 'white' },
  divider: { background: 'white' },
  titleLabel: { marginLeft: '1em' },
  tabTitle: {
    minWidth: 0,
    color: 'rgba(0, 99, 175, 0.4)',
    borderBottom: '#CFE4FD 2px inset'
  },
  indicator: {
    width: 20,
    height: 20,
    border: '2px solid currentColor',
    borderRadius: 10
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    backgroundColor: 'currentColor',
    boxShadow: 'inset 0 0 0 2px white',
    border: '2px solid currentColor',
    borderRadius: 10
  },
  indeterminateIndicator: {
    color: '#555 !important',
    width: 20,
    height: 20,
    backgroundColor: 'currentColor',
    boxShadow: 'inset 0 0 0 4px white',
    border: '2px solid currentColor',
    borderRadius: 10
  },
  biologyItem: {
    padding: '4px 16px'
  },
  label: {
    color: '#153D8A',
    '& > span': {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      cursor: 'pointer'
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
  drawerContentContainer: {
    height: 'calc(100vh - 207px)',
    overflow: 'auto',
    margin: 12
  },
  formContainer: {
    overflow: 'auto',
    maxHeight: 'calc(100vh - 183px)'
  },
  searchBar: {
    width: 'calc(100% - 2em)',
    backgroundColor: '#FFF',
    border: '1px solid #D0D7D8',
    boxShadow: '0px 1px 16px #0000000A',
    borderRadius: '25px',
    margin: '1em'
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  }
}))

export default useStyles
