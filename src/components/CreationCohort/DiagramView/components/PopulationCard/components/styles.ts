import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  drawer: {
    zIndex: 1300,
    overflowY: 'unset'
  },
  root: {
    display: 'flex',
    maxWidth: 650,
    height: '100%'
  },
  drawerTitleContainer: {
    display: 'flex',
    justifyContent: 'center',
    borderBottom: '1px solid grey'
  },
  title: {
    fontSize: 22,
    margin: '12px 0'
  },
  drawerContentContainer: {},
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
