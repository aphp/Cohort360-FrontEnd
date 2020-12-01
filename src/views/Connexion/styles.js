import { makeStyles } from '@material-ui/core/styles'
import BackgroundLogin from '../../assets/images/background-login.png'

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh'
  },
  rightPanel: {
    backgroundColor: '#FAFAFA'
  },
  logo: {
    marginBottom: theme.spacing(2)
  },
  bienvenue: {
    fontSize: '15px'
  },
  image: {
    backgroundImage: `url(${BackgroundLogin})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  },
  form: {
    width: '100%',
    margin: theme.spacing(5, 0, 1)
  },
  submit: {
    margin: theme.spacing(2, 0, 5),
    backgroundColor: '#5BC5F2',
    color: 'white',
    height: '50px',
    width: '185px',
    borderRadius: '25px'
  },
  mention: {
    marginTop: '8px'
  }
}))

export default useStyles
