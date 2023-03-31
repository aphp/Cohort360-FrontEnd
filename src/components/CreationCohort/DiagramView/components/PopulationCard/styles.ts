import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { populationCardPropsType } from './PopulationCard'

const useStyles = makeStyles((theme: Theme) => ({
  populationCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    'border-radius': 4,
    backgroundColor: '#FFFFFF',
    padding: '8px 16px',
    border: (props: populationCardPropsType) => (props.form ? '1px solid #D0D7D8' : '3px solid #D3DEE8'),
    '&:hover': {
      'border-color': (props: populationCardPropsType) => (props.form ? 'rgb(21,61,138)' : '')
    },
    flex: 1,
    margin: '12px 0',
    position: 'relative'
  },
  typography: {
    padding: (props: populationCardPropsType) => (props.form ? '0 0em 0px' : '0 1em 8px'),
    display: 'flex',
    alignItems: 'center'
  },
  centerContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  leftDiv: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('lg')]: {
      flexWrap: 'wrap'
    }
  },
  editButton: {
    color: 'currentcolor',
    [theme.breakpoints.down('lg')]: {
      position: 'absolute',
      right: 5,
      top: 8
    }
  },
  chipContainer: {
    marginLeft: 12
  },
  populationChip: {
    margin: 4,
    fontSize: 11,
    fontWeight: 'bold'
  },
  populationLabel: {
    color: '#19235A',
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
