import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  component: {
    marginBottom: '16px'
  },
  searchIcon: {
    height: '15px',
    fill: '#ED6D91',
    marginLeft: '25px'
  },
  searchBar: {
    width: '100%',
    backgroundColor: '#FFF',
    border: '1px solid #D0D7D8',
    boxShadow: '0px 1px 16px #0000000A',
    borderRadius: '25px'
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  }
}))

export default useStyles
