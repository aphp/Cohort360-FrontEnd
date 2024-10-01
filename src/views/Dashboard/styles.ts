import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'
import { smallDrawerWidth, largeDrawerWidth } from 'components/Routes/LeftSideBar/LeftSideBar'

export default makeStyles()((theme: Theme) => ({
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
  tabs: { margin: '8px 0px 0px 0px' },
  tabTitle: {
    minWidth: 0,
    fontWeight: 900,
    color: '#0063af',
    '&:last-child': {
      marginRight: 0
    },
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  indicator: {
    height: 0,
    opacity: 0
  },
  selected: {
    backgroundColor: '#fff',
    borderRadius: '50px',
    padding: '0px 25px'
  }
}))
