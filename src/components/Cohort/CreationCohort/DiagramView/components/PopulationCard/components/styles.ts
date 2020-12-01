import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '95vw',
    maxWidth: 650,
    height: '100%'
  },
  drawerTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid grey'
  },
  title: {
    fontSize: 22,
    margin: '12px 0'
  },
  drawerContentContainer: {
    flex: '1 1 auto',
    overflow: 'auto'
  },
  drawerActionContainer: {
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
