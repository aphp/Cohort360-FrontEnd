import { makeStyles } from 'tss-react/mui'
import { smallDrawerWidth, largeDrawerWidth } from 'components/Routes/LeftSideBar/LeftSideBar'

export default makeStyles()((theme) => ({
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
  title: {
    borderBottom: '1px solid #D0D7D8',
    width: '100%',
    paddingTop: '30px',
    paddingBottom: '20px',
    marginBottom: '40px'
  },
  paper: {
    background: 'transparent',
    boxShadow: 'none',
    marginBottom: 80
  },
  buttons: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(1)
  },
  cancelButton: {
    width: '125px',
    backgroundColor: '#D0D7D8',
    borderRadius: '25px'
  },
  validateButton: {
    width: '125px',
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    margin: '12px 10px',
    '&:hover': {
      backgroundColor: '#499cbf'
    }
  },
  bottomBar: {
    position: 'sticky',
    bottom: 0,
    backgroundColor: '#E6F1FD'
  },
  bottomBarShift: {
    width: `calc(100% - ${largeDrawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  }
}))
