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
    margin: 12
  },
  criteriaItem: {
    padding: '2px 16px'
  },
  indicator: {
    width: 20,
    height: 20,
    border: '2px solid currentColor',
    borderRadius: 10
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
  }
}))

export default useStyles
