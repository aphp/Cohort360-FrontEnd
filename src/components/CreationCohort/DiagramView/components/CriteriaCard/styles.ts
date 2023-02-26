import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  criteriaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#D1E2F4',
    borderRadius: 4,
    padding: 8,
    marginTop: 12,
    minWidth: 400,
    maxWidth: 800,
    position: 'relative',
    '&::before': {
      width: 38,
      height: 4,
      content: "''",
      position: 'absolute',
      background: '#19235A',
      marginLeft: -46
    }
  },
  criteriaTitleAndChips: {
    display: 'flex',
    alignItems: 'center',
    width: 'calc(100% - 80px)',
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      flexWrap: 'wrap'
    }
  },
  title: {
    whiteSpace: 'nowrap',
    marginLeft: 4
  },
  actionContainer: {
    display: 'flex',
    flexWrap: 'nowrap'
  }
}))

export default useStyles
