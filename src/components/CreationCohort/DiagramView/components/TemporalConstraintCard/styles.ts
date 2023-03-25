import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    height: 42,
    marginLeft: 12,
    padding: '4px 8px',
    borderRadius: 4
  },
  temporalConstraintSelect: {
    height: '25px',
    marginTop: '4px',
    marginRight: '2px',
    fontSize: 11,
    color: 'black',
    '&::after': {
      borderBottom: 'none'
    },
    '&::before': {
      borderBottom: 'none'
    },
    '&:hover:not($disabled):not($focused):not($error):before': {
      borderBottom: `none !important`
    }
  },
  selectIcon: {
    color: 'black'
  }
}))

export default useStyles
