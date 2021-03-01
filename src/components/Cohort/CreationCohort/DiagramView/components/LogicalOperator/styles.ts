import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  logicalOperator: {
    background: '#19235A',
    color: 'white',
    width: 42,
    height: 42,
    maxWidth: 42,
    maxHeight: 42,
    minWidth: 42,
    minHeight: 42,
    borderRadius: 5,
    textAlign: 'center',
    lineHeight: '42px'
  },
  buttonContainer: {
    background: '#19235A',
    color: 'white',
    marginTop: 16,
    width: 'fit-content',
    '&::before': {
      width: 3,
      height: 16,
      marginLeft: 16,
      content: "''",
      position: 'absolute',
      background: '#19235A',
      marginTop: -16
    }
  }
}))

export default useStyles
