import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
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
  title: { marginLeft: '1em' },
  drawerContentContainer: {
    margin: 12
  },
  criteriaItem: {
    padding: '2px 16px'
  },
  subItemsContainer: {
    position: 'relative',
    marginLeft: 12
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
