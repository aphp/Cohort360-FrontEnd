import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  tabsContainer: {
    position: 'fixed',
    bottom: 50,
    right: 240,
    '& span': { backgroundColor: 'transparent !important' }
  },
  tabItem: {
    background: '#D1E2F4',
    color: '#fff',
    outline: 'none',
    '&:first-child': {
      borderRadius: '24px 0 0 24px'
    },
    '&:last-child': {
      borderRadius: '0 24px 24px 0',
      borderLeft: '2px solid #E6F1FD'
    }
  },
  selectedTabItem: {
    outline: 'none',
    background: '#5BC5F2'
  }
}))

export default useStyles
