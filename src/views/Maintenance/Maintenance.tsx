import { Grid, Link, Typography } from '@mui/material'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import cohortLogo from 'assets/images/logo-login.png'

const skyBlue = '#5BC5F2'
const bgColor = '#E6F1FD'

export const useStyles = makeStyles()((theme: Theme) => ({
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
    fontSize: '5em',
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

const Maintenance = () => {
  const { classes } = useStyles()
  const navigate = useNavigate()
  return (
    <>
      <Link onClick={() => navigate('/home')} className={classes.logo}>
        <img src={cohortLogo} alt="Cohort360 logo" style={{ height: 50 }} />
      </Link>
      <Grid container direction="column" className={classes.megaContainer} alignItems="center">
        <Grid container direction="column" xs={5} alignItems="center" style={{ marginTop: '16em' }}>
          <Typography variant="h1" className={classes.oups}>
            Application non disponible
          </Typography>
          <Typography color="primary" variant="h2" style={{ margin: '12px 0' }}>
            Suite à la panne électrique qui a touché le prestataire en charge de l’hébergement d’une partie de ses
            serveurs informatiques, les systèmes de soins sont remis progressivement en service. Concernant les services
            de l'Entrepôt de Données de Santé, ils ne sont plus accessibles pour une durée indéterminée, cela concerne
            également Cohort360. Nous vous donnerons des informations sur le délai de rétablissement dès que possible.
            Merci pour votre compréhension.
          </Typography>
        </Grid>
        {/* <div className={cx(classes.circle, classes.small)}></div>
      <div className={cx(classes.circle, classes.medium)}></div>
      <div className={cx(classes.circle, classes.big)}></div>
      <img
        src={JohnTravolta}
        alt="John Travolta gif"
        style={{ position: 'fixed', bottom: 0, right: 0, height: '50%', zIndex: -1 }}
      /> */}
      </Grid>
    </>
  )
}

export default Maintenance
