import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  exportBox: {
    position: 'absolute',
    display: 'flex',
    top: 0,
    right: 0,
    marginRight: 10,
    marginTop: 10,
    width: '100%'
  },
  exportButton: {
    height: 40
  },
  addButton: {
    marginTop: theme.spacing(2)
  },
  dialogPaper: {
    minHeight: '80vh',
    maxHeight: '80vh',
    position: 'relative',
    height: '100%'
  },
  anonymChoice: {
    width: '100%',
    textAlign: 'center'
  },
  riskText: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  alertREDCAP: {
    marginTop: 60
  },
  importantText: {
    color: 'red'
  }
}))

export default useStyles
