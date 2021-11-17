import { makeStyles } from '@material-ui/core/styles'
import { smallDrawerWidth, largeDrawerWidth } from 'components/LeftSideBar/LeftSideBar'

export const itemStyles = {
  group: {
    backgroundColor: 'gray',
    color: 'white',
    '&:hover': {
      backgroundColor: 'lightgray'
    }
  },
  hospital: {
    backgroundColor: 'darkgray',
    color: 'white',
    '&:hover': {
      backgroundColor: 'lightgray'
    }
  },
  service: {
    backgroundColor: 'lightgray',
    color: 'black',
    '&:hover': {
      backgroundColor: 'white'
    }
  },
  unit: {
    backgroundColor: 'white',
    color: 'black',
    '&:hover': {
      backgroundColor: 'lightgray'
    }
  }
}

export default makeStyles((theme) => ({
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
    paddingTop: '80px',
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
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(4),
    '&:hover': {
      backgroundColor: '#499cbf'
    }
  },
  bottomBar: {
    position: 'fixed',
    bottom: 0,
    backgroundColor: '#E6F1FD'
  }
}))
