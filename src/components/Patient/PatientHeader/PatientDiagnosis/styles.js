import { makeStyles } from '@material-ui/core/styles'

export default makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: 0,
    marginLeft: '25px',
    marginTop: 0
  },
  item: {
    margin: theme.spacing(0, 1, 1, 0)
  },
  diagnosticChip: {
    backgroundColor: '#0063AF',
    color: '#FFF',
    fontStyle: 'italic',
    fontSize: '12px'
  }
}))
