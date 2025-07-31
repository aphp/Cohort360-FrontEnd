import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Grid, Link, Typography } from '@mui/material'

import JohnTravolta from 'assets/images/johntravolta.gif'
import cohortLogo from 'assets/images/logo-login.png'

import useStyles from './styles'
import { AppConfig } from 'config'

const PageNotFound: React.FC = () => {
  const { classes, cx } = useStyles()
  const navigate = useNavigate()
  const appConfig = useContext(AppConfig)

  return (
    <>
      <Link onClick={() => navigate('/home')} className={classes.logo}>
        <img src={cohortLogo} alt="Cohort360 logo" style={{ height: 50 }} />
      </Link>
      <Grid container className={classes.megaContainer} sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Grid container size={5} sx={{ flexDirection: 'column', alignItems: 'center' }} style={{ marginTop: '16em' }}>
          <Typography variant="h1" className={classes.oups}>
            Oups !
          </Typography>
          <Typography color="primary" variant="h2" style={{ margin: '12px 0' }}>
            La page que vous avez sélectionné n'existe pas ou plus.
          </Typography>
          <Typography color="primary" variant="h2" style={{ margin: '12px 0' }}>
            Si vous pensez qu'il s'agit d'une erreur, vous pouvez contacter le support Cohort360 à l'adresse suivante :{' '}
            {appConfig.system.mailSupport}.
          </Typography>
          <Button onClick={() => navigate('/home')} variant="contained" className={classes.button}>
            Accueil
          </Button>
        </Grid>
        <div className={cx(classes.circle, classes.small)}></div>
        <div className={cx(classes.circle, classes.medium)}></div>
        <div className={cx(classes.circle, classes.big)}></div>
        <img
          src={JohnTravolta}
          alt="John Travolta gif"
          style={{ position: 'fixed', bottom: 0, right: 0, height: '50%', zIndex: -1 }}
        />
      </Grid>
    </>
  )
}

export default PageNotFound
