import { makeStyles } from '@material-ui/core/styles'
import {
  smallDrawerWidth,
  largeDrawerWidth
} from '../../components/LeftSideBar/LeftSideBar'

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
  buttons: {
    marginTop: theme.spacing(3),
    display: 'flex',
    justifyContent: 'flex-end'
  },
  validateButton: {
    marginLeft: theme.spacing(2)
  }
}))
