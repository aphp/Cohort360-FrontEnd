import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2)
  },
  dialogContent: {
    padding: theme.spacing(2)
  },
  dialogActions: {
    margin: 0,
    padding: theme.spacing(1)
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  list: {
    border: `1px solid ${theme.palette.grey[500]}`
  },
  listItem: {}
}))

export default useStyles
