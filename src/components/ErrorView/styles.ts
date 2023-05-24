import { makeStyles } from 'tss-react/mui'
import { smallDrawerWidth, largeDrawerWidth } from 'components/Routes/LeftSideBar/LeftSideBar'

export default makeStyles()((theme: any) => ({
  appBar: {
    height: '100vh',
    marginLeft: smallDrawerWidth,
    width: `calc(100% - ${smallDrawerWidth}px)`,
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    height: '100vh',
    marginLeft: largeDrawerWidth,
    width: `calc(100% - ${largeDrawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  item: {
    width: 'calc(100vw - 69px)',
    maxWidth: 500
  }
}))
