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
    color: 'white',
    // Not default
    marginBottom: 46
  },
  backButton: { color: 'white' },
  divider: { background: 'white' },
  titleLabel: { marginLeft: '1em' },
  medicationHierarchyActionContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    borderTop: '1px solid grey',
    backgroundColor: 'white',
    position: 'absolute',
    width: '100%',
    bottom: 0,
    left: 0,
    '& > button': {
      margin: '12px 8px'
    }
  },
  medicationItem: {
    padding: '2px 16px'
  },
  label: {
    '& > span': {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      cursor: 'pointer'
    }
  },
  indicator: {
    width: 20,
    height: 20,
    border: '2px solid currentColor',
    borderRadius: 10,
    backgroundColor: '#fff'
  },
  loader: {
    height: '4px',
    marginTop: '2px'
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
  drawerContentContainer: {
    maxHeight: 'calc(100vh - 250px)',
    overflow: 'auto',
    margin: 12
  },
  subItemsContainer: {
    position: 'relative',
    marginLeft: 25
  },
  subItemsContainerIndicator: {
    content: '""',
    position: 'absolute',
    width: 2,
    height: 'calc(100% + -10px)',
    bottom: 15,
    background: '#D0D7D8'
  },
  subItemsIndicator: {
    content: '""',
    position: 'absolute',
    width: 17,
    height: 2,
    marginTop: 14.5,
    background: '#D0D7D8'
  },
  referentielContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  select: {
    marginLeft: 8,
    borderRadius: 25,
    backgroundColor: '#FFF',
    '& .MuiSelect-select': {
      borderRadius: 25
    }
  }
}))

export default useStyles
