import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '95vw',
    maxWidth: 650,
    height: '100%'
  },
  drawerTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    height: 72,
    padding: 20,
    color: 'white',
    backgroundColor: '#317EAA'
  },
  title: {
    marginLeft: theme.spacing(1)
  },
  drawerContentContainer: {
    margin: 12,
    backgroundColor: 'rgb(246, 248, 250)',
    padding: 12
  },
  listItem: {
    padding: 8,
    border: '1px solid grey',
    borderRadius: 5,
    background: 'white',
    margin: '8px 0'
  },
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
  }
}))

export default useStyles
