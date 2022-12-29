import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  searchBar: {
    width: '100%',
    backgroundColor: '#FFF',
    border: '1px solid #c4c4c4',
    borderRadius: '25px',
    padding: '4px',
    boxShadow: '0px 1px 16px #0000000A',
    marginLeft: 4
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  }
}))

export default useStyles
