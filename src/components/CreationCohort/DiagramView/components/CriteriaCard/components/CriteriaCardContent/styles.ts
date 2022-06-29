import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles((theme: Theme) => ({
  cardContent: {
    display: 'flex',
    padding: 0,
    flexWrap: 'wrap',
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
    [theme.breakpoints.up('md')]: {
      width: 'calc(100% - 150px)'
    }
  },
  criteriaChip: {
    backgroundColor: '#FFFFFF',
    margin: '4px'
  },
  chevronIcon: {
    outline: 'none !important',
    position: 'absolute',
    right: 0,
    top: 5
  }
}))

export default useStyles
