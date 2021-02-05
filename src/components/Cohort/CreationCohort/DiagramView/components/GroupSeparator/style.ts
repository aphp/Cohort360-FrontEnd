import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    '&::before': {
      content: '""',
      width: 2.1,
      height: 18,
      background: '#D0D7D8',
      display: 'block',
      margin: '0 auto'
    },
    '&::after': {
      content: '""',
      width: 2.1,
      height: 18,
      background: '#D0D7D8',
      display: 'block',
      margin: '0 auto'
    },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  separator: {
    width: 'fit-content',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    minWidth: 42,
    minHeight: 42,
    maxHeight: 42,
    borderRadius: 42,
    padding: theme.spacing(1),
    backgroundColor: theme.palette.primary.main
  }
}))

export default useStyles
