import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexWrap: 'nowrap',
    backgroundColor: '#EFBE5E',
    width: 'fit-content',
    height: '30px',
    borderRadius: '5px'
  },
  temporalConstraintTypo: {
    marginTop: '5px',
    marginRight: '4px',
    paddingLeft: '2px'
  },
  temporalConstraintSelect: {
    height: '25px',
    marginTop: '4px',
    marginRight: '2px'
  }
}))

export default useStyles
