import makeStyles from '@mui/styles/makeStyles';

const skyBlue = '#5BC5F2'
const bgColor = '#E6F1FD'

const useStyles = makeStyles((theme) => ({
  logo: {
    position: 'fixed',
    top: 12,
    left: 12
  },
  megaContainer: {
    backgroundImage: `linear-gradient(to bottom right, ${skyBlue}, ${bgColor} 60%)`,
    color: '#fff',
    height: '100vh',
    textAlign: 'center',
    position: 'fixed',
    zIndex: -3
  },
  oups: {
    fontSize: '10em',
    margin: '20px 0',
    textShadow: '2px 4px 3px rgba(0,0,0,0.3)'
  },
  button: {
    margin: theme.spacing(4, 0),
    backgroundColor: skyBlue,
    color: 'white',
    height: 50,
    width: 185,
    borderRadius: 25,
    textTransform: 'uppercase'
  },
  circle: {
    backgroundImage: `linear-gradient(to top right, ${skyBlue}, ${bgColor})`,
    borderRadius: '50%',
    position: 'absolute',
    zIndex: -2
  },
  small: {
    zIndex: -2,
    top: 200,
    left: 150,
    width: 100,
    height: 100
  },
  medium: {
    zIndex: -2,
    backgroundImage: `linear-gradient(to bottom left, ${skyBlue}, ${bgColor})`,
    bottom: -70,
    left: 0,
    width: 200,
    height: 200
  },
  big: {
    position: 'absolute',
    zIndex: -2,
    top: -100,
    right: -50,
    width: 400,
    height: 400
  }
}))

export default useStyles
