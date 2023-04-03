import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(() => ({
  backDrop: {
    height: '100vh',
    width: '100vw',
    position: 'absolute',
    top: 0,
    left: 0
  },
  mainLogicalOperator: {
    background: '#19235A',
    boxSizing: 'border-box',
    border: '3px solid #19235A',
    color: 'white',
    width: 50,
    height: 36,
    // maxWidth: 50,
    // maxHeight: 36,
    // minWidth: 50,
    // minHeight: 36,
    borderRadius: 18,
    textAlign: 'center',
    marginTop: 12,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'left',
    '&::after': {
      position: 'absolute',
      content: "''",
      height: 12,
      width: 4,
      background: '#19235a',
      top: 'calc(100% + 3px)',
      left: 20
    }
  },
  logicalOperator: {
    background: '#19235A',
    boxSizing: 'border-box',
    border: '3px solid #19235A',
    color: 'white',
    height: 36,
    minHeight: 36,
    borderRadius: 18,
    textAlign: 'center',
    marginTop: 12,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'left',
    '&::before': {
      position: 'absolute',
      content: "''",
      height: 4,
      width: 36,
      background: '#19235a',
      top: 12,
      left: -38
    },
    '&::after': {
      position: 'absolute',
      content: "''",
      height: 12,
      width: 4,
      background: '#19235a',
      top: 'calc(100% + 3px)',
      left: 20
    }
  },
  textOperator: {
    lineHeight: '30px',
    margin: 'auto',
    padding: '0 4px',
    fontSize: 13
  },
  descriptionText: {
    margin: 'auto',
    padding: '0 4px',
    fontSize: 13,
    marginTop: 5,
    fontWeight: 100
  },
  input: {
    width: 50,
    '& > div': {
      color: 'currentColor !important'
    },
    '& > div > input': {
      color: 'currentColor !important'
    }
  },
  inputSelect: {
    color: 'currentColor',
    fontWeight: 'bolder',
    fontStyle: 'italic',
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
    color: 'currentColor',
    marginTop: -2
  },
  deleteButton: {
    marginTop: -2,
    marginLeft: 12,
    color: 'currentColor',
    marginRight: 4,
    '& > span > svg': {
      fontSize: 18
    }
  }
}))

export default useStyles
