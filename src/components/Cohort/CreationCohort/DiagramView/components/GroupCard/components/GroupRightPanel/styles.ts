import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: 650,
    height: 'calc(100% - 63px)'
  },
  drawerTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    height: 72,
    padding: 20,
    color: 'white',
    backgroundColor: '#317EAA',
    width: '100%'
  },
  title: {
    marginLeft: theme.spacing(1)
  },
  drawerContentContainer: {
    padding: theme.spacing(3),
    flex: 1,
    overflowY: 'auto'
  },
  listItem: {
    padding: 8,
    border: '1px solid grey',
    borderRadius: 5,
    background: 'white',
    margin: '8px 0'
  },
  itemContent: {},
  groupListItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: 8,
    border: '1px solid grey',
    borderRadius: 5,
    background: 'white',
    margin: '8px 0'
  },
  listTitle: {
    fontSize: 16,
    color: 'grey',
    paddingBottom: 8,
    fontWeight: 700
  },
  listDesc: {
    '& > div': {
      paddingBottom: '0px !important'
    }
  },
  groupActionContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    borderTop: '1px solid grey',
    position: 'absolute',
    width: '100%',
    bottom: 0,
    left: 0,
    '& > button': {
      margin: '12px 8px'
    }
  },
  typeCriteriaContainer: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: 'rgb(246, 248, 250)'
  },
  operatorSelect: {
    marginRight: 8,
    width: 150
  },
  switch: {
    marginBottom: -10,
    marginLeft: 8
  },
  numberSelect: {
    width: 100,
    marginRight: 8
  }
}))

export default useStyles
