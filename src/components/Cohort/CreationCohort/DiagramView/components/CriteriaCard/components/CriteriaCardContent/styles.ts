import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  cardContent: {
    display: 'flex',
    padding: 0,
    width: 'calc(100% - 150px)',
    flexWrap: 'wrap',
    overflow: 'hidden',
    height: 32
  },
  criteriaChip: {
    backgroundColor: '#FFFFFF',
    margin: '0 4px'
  },
  criteriaType: {
    color: '#5BC5F2',
    textDecoration: 'underline',
    fontWeight: 'bold'
  },
  label: {
    fontWeight: 'bold'
  }
}))

export default useStyles
