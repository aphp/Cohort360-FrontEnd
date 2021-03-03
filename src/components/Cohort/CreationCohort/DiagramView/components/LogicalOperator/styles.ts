import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  buttonContainer: {
    background: 'white',
    color: 'white',
    marginTop: 16,
    width: 'fit-content',
    position: 'relative',
    '&::before': {
      width: 3,
      height: 16,
      content: "''",
      position: 'absolute',
      background: '#19235A',
      marginTop: -16,
      marginLeft: 19
    },
    '& > button': {
      background: '#19235A'
    }
  },
  operatorRoot: {
    disaplay: 'flex'
  },
  operatorChild: {
    marginLeft: 19,
    borderLeft: '3px solid #19235a',
    paddingLeft: 35
  }
}))

export default useStyles
