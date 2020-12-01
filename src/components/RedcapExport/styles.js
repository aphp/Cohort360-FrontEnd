import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
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
    position: 'relative',
    marginRight: 5,
    marginBottom: 5,
    marginTop: 5,
    width: 75
  },
  dialogPaper: {
    minHeight: '80vh',
    maxHeight: '80vh',
    position: 'relative',
    height: '100%'
  },
  exportContent: {
    marginLeft: '2%',
    marginRight: '2%',
    height: '85%',
    overflowY: 'scroll'
  },
  anonymChoice: {
    width: '100%',
    textAlign: 'center'
  },
  insideExportContent: {
    marginRight: 5
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
