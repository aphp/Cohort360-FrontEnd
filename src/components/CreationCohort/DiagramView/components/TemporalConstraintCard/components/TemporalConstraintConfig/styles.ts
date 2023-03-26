import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(() => ({
  input: {
    width: 80,
    backgroundColor: '#FFF',
    border: '1px solid #D0D7D8',
    boxShadow: '0px 1px 16px #0000000A',
    borderRadius: '25px',
    margin: '0 8px',
    padding: '0 8px'
  },
  button: {
    backgroundColor: '#5bc5f2',
    color: '#FFF',
    borderRadius: 25,
    padding: '4px 12px',
    marginTop: 8,
    '&:hover': {
      backgroundColor: '#499cbf'
    }
  },
  avatar: {
    backgroundColor: '#5BC5F2',
    width: 20,
    height: 20,
    fontSize: 12,
    marginRight: 4
  },
  flexBaseline: {
    display: 'flex',
    alignItems: 'baseline'
  },
  inputError: {
    border: '1px solid red'
  }
}))

export default useStyles
