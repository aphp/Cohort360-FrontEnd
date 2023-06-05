import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import BackgroundLogin from 'assets/images/background-login.png'

const useStyles = makeStyles((theme: Theme) => ({
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
    fontSize: 15
  },
  image: {
    backgroundImage: `url(${BackgroundLogin})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  },
  submit: {
    margin: theme.spacing(2, 0, 0),
    backgroundColor: '#5BC5F2',
    color: 'white',
    height: 50,
    width: 185,
    borderRadius: 25
  },
  oidcButton: {
    backgroundColor: '#153D8A',
    width: 250
  },
  mention: {
    marginTop: 8
  },
  oidcConnexionProgress: {
    margin: '10%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: 30
  }
}))

export default useStyles
