import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'
import BackgroundLogin from 'assets/images/background-login.png'
import { aphp, eds } from 'styles/palette'

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    height: '100vh'
  },
  rightPanel: {
    backgroundColor: '#FAFAFA'
  },
  loginBlock: {
    width: 'calc(100% - 32px)',
    maxWidth: 490
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
    width: 250,
    marginBottom: 40
  },
  oidcButtonAboveHelp: {
    marginBottom: theme.spacing(2)
  },
  mfaBanner: {
    width: '100%',
    maxWidth: 489,
    marginTop: theme.spacing(3),
    padding: theme.spacing(1, 1.5),
    border: `1px solid ${eds.blue[600]}`,
    borderRadius: 8,
    backgroundColor: aphp.bleu[75],
    color: aphp.bleu[600]
  },
  mfaBannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: theme.spacing(1)
  },
  mfaBannerBody: {
    fontSize: 14,
    color: aphp.bleu[600]
  },
  mfaHelp: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    color: aphp.bleu[600],
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(2)
  },
  mfaHelpBold: {
    fontWeight: 'bold'
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
