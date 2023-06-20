import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'
import { PopulationCardPropsType } from './PopulationCard'

const useStyles = makeStyles<PopulationCardPropsType>()((theme: Theme, params) => ({
  populationCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    padding: '8px 16px',
    border: params.form ? '1px solid #D0D7D8' : '3px solid #D3DEE8',
    '&:hover': {
      borderColor: params.form ? 'rgb(21,61,138)' : ''
    },
    flex: 1,
    margin: '12px 0',
    position: 'relative'
  },
  typography: {
    padding: params.form ? '0px' : '0 1em',
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
    color: 'currentcolor'
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
