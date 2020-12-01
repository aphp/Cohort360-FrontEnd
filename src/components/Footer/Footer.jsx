import React from 'react'
import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link'
import logoAPHP from '../../assets/images/logo-aphp.png'

import useStyles from './styles'

const Footer = () => {
  const classes = useStyles()

  return (
    <Grid container justify="center">
      <Link href="https://eds.aphp.fr">
        <img className={classes.logoAPHP} src={logoAPHP} alt="Footer" />
      </Link>
    </Grid>
  )
}

export default Footer
