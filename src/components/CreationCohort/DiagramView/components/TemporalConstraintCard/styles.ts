import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    width: 'fit-content',
    marginLeft: 12,
    alignSelf: 'center',
    padding: '4px 8px',
    [theme.breakpoints.down('md')]: {
      alignSelf: 'flex-end'
    }
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
