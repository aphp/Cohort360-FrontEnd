import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
  documentButtons: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  searchBar: {
    width: '250px',
    backgroundColor: '#FFF',
    border: '1px solid #D0D7D8',
    borderRadius: '25px',
    paddingRight: 8
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  searchButton: {
    minWidth: 150,
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    marginLeft: 8
  },
  gridAdvancedSearch: {
    backgroundColor: '#FFF',
    border: '1px solid #c4c4c4',
    padding: 8,
    borderRadius: 25,
    marginBlock: 4
  },
  gridAdvancedSearchSqared: {
    backgroundColor: '#FFF',
    border: '1px solid #c4c4c4',
    padding: 8,
    borderRadius: 4
  },
  slash: {
    fontSize: 18,
    color: 'currentColor'
  },
  activeButton: {
    opacity: 0.6
  },
  error: {
    border: '1px solid #f44336'
  },
  errorText: {
    color: '#f44336'
  },
  buttonContainer: {
    borderRadius: 25,
    height: 41,
    '& > button': {
      backgroundColor: '#5BC5F2',
      color: 'white'
    },
    '&:focus > button': {
      backgroundColor: '#5BC5F2',
      color: 'white'
    },
    '&:hover > button': {
      backgroundColor: '#5BC5F2',
      color: 'white'
    },
    '& > button:first-child': {
      borderRadius: '25px 0 0 25px'
    },
    '& > button:last-child': {
      borderRadius: '0 25px 25px 0'
    }
  }
}))

export default useStyles
