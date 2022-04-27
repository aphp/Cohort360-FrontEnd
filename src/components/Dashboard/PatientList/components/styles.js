import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  chartOverlay: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(2),
    padding: '0.7rem',
    backgroundColor: theme.palette.white,
    height: '300px',
    width: '100%',
    borderRadius: '8px',
    alignItems: 'center',
    fontSize: '16px'
  },
  chartTitle: {
    borderBottom: '2px inset #E6F1FD',
    paddingBottom: '10px'
  }
}))

export default useStyles
