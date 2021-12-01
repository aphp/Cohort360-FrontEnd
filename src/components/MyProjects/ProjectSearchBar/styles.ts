import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  searchBar: {
    minWidth: '200px',
    backgroundColor: '#FFF',
    border: '1px solid #D0D7D8',
    boxShadow: '0px 1px 16px #0000000A',
    borderRadius: '25px'
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  searchButton: {
    width: '125px',
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    marginLeft: 8
  }
}))

export default useStyles
