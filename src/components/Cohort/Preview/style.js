import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: '#E6F1FD'
  },
  outlinedContent: {
    backgroundColor: '#E6F1FD'
  },
  header: {
    backgroundColor: '#F3F8FE',
    height: '100px',
    overflowY: 'scroll'
  },
  repartitionTable: {
    margin: theme.spacing(2),
    height: '80%',
    width: '97%',
    borderRadius: '8px'
  },
  nbPatients: {
    marginTop: '24px'
  },
  nbPatientsOverlay: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.white,
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    height: '148px',
    borderRadius: '8px',
    alignItems: 'center',
    fontSize: '16px',
    width: '95%'
  },
  tableHead: {
    height: '42px'
  },
  tableHeadCell: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#0063AF',
    padding: '0 20px',
    textTransform: 'uppercase'
  },
  chartOverlay: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.white,
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    height: '300px',
    borderRadius: '8px',
    alignItems: 'center',
    fontSize: '16px',
    width: '95%'
  },
  chartTitle: {
    borderBottom: '2px inset #E6F1FD',
    paddingBottom: '10px'
  },
  loadingSpinner: {
    position: 'absolute',
    top: '50%',
    right: '50%'
  },
  perimetersChipsDiv: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: 0,
    marginTop: 4,
    marginBottom: 0
  },
  item: {
    margin: theme.spacing(0, 1, 0, 0)
  },
  perimetersChip: {
    backgroundColor: '#0063AF',
    color: '#FFF',
    fontStyle: 'italic',
    fontSize: '12px'
  },
  overflow: {
    overflowY: 'scroll'
  }
}))

export default useStyles
