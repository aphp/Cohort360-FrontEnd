import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    width: 'fit-content',
    marginLeft: 12,
    alignSelf: 'center',
    padding: '4px 8px'
  },
  temporalConstraintTypo: {
    marginTop: '5px',
    marginRight: '4px',
    paddingLeft: '2px'
  },
  temporalConstraintSelect: {
    height: '25px',
    marginTop: '4px',
    marginRight: '2px',
    '&::after': {
      borderBottom: 'none'
    },
    '&::before': {
      borderBottom: 'none'
    },
    '&:hover:not($disabled):not($focused):not($error):before': {
      borderBottom: `none !important`
    },
    fontSize: 11,
    color: 'black'
  },
  selectIcon: {
    color: 'black'
  }
}))

export default useStyles
