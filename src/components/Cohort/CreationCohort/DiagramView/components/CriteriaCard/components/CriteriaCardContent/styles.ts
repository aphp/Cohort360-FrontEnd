import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
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
  criteriaType: {
    color: '#5BC5F2',
    textDecoration: 'underline',
    fontWeight: 'bold'
  },
  label: {
    fontWeight: 'bold'
  },
  chevronIcon: {
    outline: 'none !important',
    position: 'absolute',
    right: 0,
    top: 5
  }
}))

export default useStyles
