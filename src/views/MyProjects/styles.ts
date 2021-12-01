import { makeStyles } from '@material-ui/core/styles'
import { smallDrawerWidth, largeDrawerWidth } from 'components/LeftSideBar/LeftSideBar'

const useStyles = makeStyles((theme) => ({
  appBar: {
    marginLeft: smallDrawerWidth,
    width: `calc(100% - ${smallDrawerWidth}px)`,
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: largeDrawerWidth,
    width: `calc(100% - ${largeDrawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  loaderGrid: {
    height: '40vh'
  },
  title: {
    paddingTop: '80px',
    paddingBottom: '20px',
    width: '100%',
    borderBottom: '1px solid #D0D7D8'
  },
  actionContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  secondaryContainer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  addButton: {
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    marginLeft: 8,
    padding: '8px 12px'
  },
  addIconButton: {
    marginLeft: 8,
    backgroundColor: '#5BC5F2',
    color: '#FFF'
  }
}))

export default useStyles
