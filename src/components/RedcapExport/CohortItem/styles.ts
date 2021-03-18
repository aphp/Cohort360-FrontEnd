import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  attributeSelect: {
    maxWidth: 250
  },
  attributeText: {
    width: '100%'
  },
  CohortItemCard: {
    display: 'flex',
    margin: 15,
    padding: 5,
    justifyContent: 'space-between'
  },
  crfButton: {
    width: 20
  },
  flex: {
    display: 'flex'
  }
}))

export default useStyles
