import { makeStyles } from '@material-ui/core/styles'

export const itemStyles = {
  group: {
    // backgroundColor: 'gray',
    // color: 'white',
    '&:hover': {
      backgroundColor: 'lightgray'
    }
  },
  hospital: {
    backgroundColor: '#fcfcfc',
    // color: 'white',
    '&:hover': {
      backgroundColor: 'lightgray'
    }
  },
  service: {
    // backgroundColor: 'lightgray',
    // color: 'black',
    '&:hover': {
      backgroundColor: 'white'
    }
  },
  unit: {
    // backgroundColor: 'white',
    // color: 'black',
    '&:hover': {
      backgroundColor: 'lightgray'
    }
  }
}

export default makeStyles((theme) => ({
  buttons: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    marginRight: theme.spacing(1),
    display: 'flex',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    width: '125px',
    backgroundColor: '#D0D7D8',
    borderRadius: '25px'
  },
  validateButton: {
    width: '125px',
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    marginLeft: theme.spacing(2),
    '&:hover': {
      backgroundColor: '#499cbf'
    }
  },
  container: {
    height: 'calc(100% - 84px)',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column'
  }
}))
