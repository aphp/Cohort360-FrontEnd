import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    backgroundColor: '#E6F1FD'
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
  fixedChartOverlay: {
    display: 'flex',
    flexDirection: 'column',
    height: '300px',
    alignItems: 'center'
  },
  chartOverlay: {
    backgroundColor: '#FFF',
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    borderRadius: '8px',
    fontSize: '16px',
    width: 'calc(100% - 16px)'
  },
  chartTitle: {
    borderBottom: '2px inset #E6F1FD',
    paddingBottom: '10px'
  }
}))

export default useStyles
