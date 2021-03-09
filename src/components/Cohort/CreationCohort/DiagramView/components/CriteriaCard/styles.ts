import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  criteriaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#D1E2F4',
    borderRadius: 4,
    padding: 8,
    marginTop: 12,
    width: 800,
    '&::before': {
      width: 38,
      height: 3,
      content: "''",
      position: 'absolute',
      background: '#19235A',
      marginLeft: -46
    }
  },
  criteriaTitleAndChips: {
    display: 'flex',
    alignItems: 'center'
  }
}))

export default useStyles
