import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    padding: 0
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
