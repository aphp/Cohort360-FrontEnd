import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    height: 42,
    marginLeft: 12,
    padding: '4px 8px',
    borderRadius: 4,
    [theme.breakpoints.down('lg')]: {
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
