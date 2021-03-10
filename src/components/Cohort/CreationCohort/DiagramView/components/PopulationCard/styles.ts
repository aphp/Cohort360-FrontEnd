import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  newPopulationCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    'border-radius': 4,
    backgroundColor: '#FFFFFF',
    padding: 15,
    border: '3px solid #D3DEE8',
    flex: 1,
    minWidth: 350,
    margin: '12px 0'
  },
  centerContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  leftDiv: {
    display: 'flex',
    alignItems: 'center'
  },
  chipContainer: {
    marginLeft: 12
  },
  populationChip: {
    margin: '0 4px'
  },
  populationLabel: {
    textDecoration: 'underline'
  },
  actionButton: {
    backgroundColor: '#19235A',
    color: '#FFFFFF',
    borderRadius: 25,
    padding: '6px 12px',
    '&:hover': {
      backgroundColor: '#19235A'
    }
  }
}))

export default useStyles
