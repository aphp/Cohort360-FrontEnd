import React from 'react'

import { Button, Grid, Link, Typography } from '@mui/material'

import JohnTravolta from 'assets/images/johntravolta.gif'
import cohortLogo from 'assets/images/logo-login.png'

import clsx from 'clsx'

import useStyles from './styles'

const PageNotFound: React.FC = () => {
  const classes = useStyles()

  return (
    <>
      <Link href="/home" className={classes.logo}>
        <img src={cohortLogo} alt="Cohort360 logo" style={{ height: 50 }} />
      </Link>
      <Grid container direction="column" className={classes.megaContainer} alignItems="center">
        <Grid container direction="column" xs={5} alignItems="center" style={{ marginTop: '16em' }}>
          <Typography variant="h1" className={classes.oups}>
            Oups !
          </Typography>
          <Typography color="primary" variant="h2" style={{ margin: '12px 0' }}>
            La page que vous avez sélectionné n'existe pas ou plus.
          </Typography>
          <Typography color="primary" variant="h2" style={{ margin: '12px 0' }}>
            Si vous pensez qu'il s'agit d'une erreur, vous pouvez contacter le support Cohort360 à l'adresse suivante :
            dsi-id-recherche-support-cohort360@aphp.fr.
          </Typography>
          <Button href="/home" variant="contained" className={classes.button}>
            Accueil
          </Button>
        </Grid>
        <div className={clsx(classes.circle, classes.small)}></div>
        <div className={clsx(classes.circle, classes.medium)}></div>
        <div className={clsx(classes.circle, classes.big)}></div>
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
