import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  backDrop: {
    height: '100vh',
    width: '100vw',
    position: 'absolute',
    top: 0,
    left: 0
  },
  buttonContainer: {
    marginTop: 14,
    width: 'fit-content',
    position: 'relative',
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
    marginLeft: 7.5,
    height: 34,
    minHeight: 34,
    maxHeight: 34,
    width: 34,
    minWidth: 34,
    maxWidth: 34,
    position: 'relative',
    '&:hover': {
      background: '#19235A'
    },
    '&.Mui-disabled': {
      background: '#0000001F',
      color: 'rgba(0,0,0,0.26)',
      cursor: 'auto'
    }
  },
  operatorChild: {
    marginLeft: 23,
    borderLeft: '4px solid #19235a',
    paddingLeft: 35,
    display: 'flex',
    flexDirection: 'column'
  }
}))

export default useStyles
