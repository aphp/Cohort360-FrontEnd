import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexWrap: 'nowrap',
    backgroundColor: '#EFBE5E',
    width: 'fit-content',
    height: '35px',
    borderRadius: '5px'
  },
  temporalConstraintTypo: {
    marginTop: '4px',
    marginRight: '4px'
  },
  temporalConstraintSelect: {
    height: '25px',
    marginTop: '4px'
  }
}))

export default useStyles
