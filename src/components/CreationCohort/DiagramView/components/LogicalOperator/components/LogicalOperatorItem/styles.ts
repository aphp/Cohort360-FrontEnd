import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  mainLogicalOperator: {
    background: '#19235A',
    boxSizing: 'border-box',
    border: '3px solid #19235A',
    color: 'white',
    width: 50,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    marginTop: 12,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'left'
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
    }
  },
  descriptionText: {
    margin: 'auto',
    padding: '0 4px',
    fontSize: 13,
    marginTop: 5,
    fontWeight: 100
  },
  textOperator: {
    lineHeight: '30px',
    margin: 'auto',
    padding: '0 4px',
    fontSize: 13
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
