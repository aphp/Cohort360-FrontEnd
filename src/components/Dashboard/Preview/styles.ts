import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: '#E6F1FD'
  },
  header: {
    backgroundColor: '#F3F8FE',
    minHeight: '100px',
    padding: theme.spacing(1),
    overflowY: 'scroll'
  },
  progressContainer: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  repartitionTable: {
    margin: theme.spacing(1),
    height: 150,
    width: 'calc(100% - 16px)',
    borderRadius: '8px'
  },
  nbPatients: {
    marginTop: '24px'
  },
  nbPatientsOverlay: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFF',
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    height: '148px',
    borderRadius: '8px',
    alignItems: 'center',
    fontSize: '16px',
    width: 'calc(100% - 16px)'
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
    backgroundColor: '#FFF',
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    height: '300px',
    borderRadius: '8px',
    alignItems: 'center',
    fontSize: '16px',
    width: 'calc(100% - 16px)'
  },
  chartTitle: {
    borderBottom: '2px inset #E6F1FD',
    paddingBottom: '10px'
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
    margin: theme.spacing(0.5)
  },
  perimetersChip: {
    backgroundColor: '#0063AF',
    color: '#FFF',
    fontStyle: 'italic',
    fontSize: '12px'
  },
  populationLabel: {
    color: '#0063AF',
    textDecoration: 'underline'
  }
}))

export default useStyles
