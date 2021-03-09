import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    width: 'fit-content',
    borderRadius: '5px',
    marginLeft: 12,
    alignSelf: 'center',
    padding: 8
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
