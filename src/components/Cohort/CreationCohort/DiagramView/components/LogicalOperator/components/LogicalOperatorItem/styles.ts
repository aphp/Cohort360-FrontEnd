import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  mainLogicalOperator: {
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
    lineHeight: '42px',
    marginTop: 12,
    position: 'relative',
    '&::after': {
      position: 'absolute',
      content: "''",
      height: 12,
      width: 3,
      background: '#19235a',
      marginTop: 42,
      marginLeft: -14
    }
  },
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
    lineHeight: '42px',
    marginTop: 12,
    position: 'relative',
    '&::before': {
      position: 'absolute',
      content: "''",
      height: 3,
      width: 35,
      background: '#19235a',
      marginTop: 19.5,
      marginLeft: -47
    },
    '&::after': {
      position: 'absolute',
      content: "''",
      height: 12,
      width: 3,
      background: '#19235a',
      marginTop: 42,
      marginLeft: -14
    }
  }
}))

export default useStyles
