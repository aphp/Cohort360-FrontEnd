import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  buttonContainer: {
    marginTop: 14,
    width: 'fit-content',
    position: 'relative',
    '&::before': {
      width: 3,
      height: 16,
      content: "''",
      position: 'absolute',
      background: '#19235A',
      marginTop: -16,
      marginLeft: 23
    },
    '& > button': {
      borderColor: 'white !important',
      color: 'white',
      background: '#19235A',
      fontSize: 13
    },
    '& > button:hover': {
      background: '#19235A'
    }
  },
  addButton: {
    color: 'white',
    background: '#19235A',
    fontSize: 13,
    marginTop: 14,
    marginLeft: 7,
    height: 34,
    minHeight: 34,
    maxHeight: 34,
    width: 34,
    minWidth: 34,
    maxWidth: 34,
    '&::before': {
      width: 3,
      height: 16,
      content: "''",
      position: 'absolute',
      background: '#19235A',
      marginTop: -46
    },
    '&:hover': {
      background: '#19235A'
    }
  },
  operatorChild: {
    marginLeft: 23,
    borderLeft: '3px solid #19235a',
    paddingLeft: 35
  }
}))

export default useStyles
