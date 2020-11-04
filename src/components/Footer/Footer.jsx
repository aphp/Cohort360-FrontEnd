import React from 'react'
import Grid from '@material-ui/core/Grid'
import logoAPHP from '../../assets/images/logo-aphp.png'

import useStyles from './styles'

const Footer = (props) => {
  const classes = useStyles()

  return (
    <Grid container justify="center">
      <a href={'https://eds.aphp.fr'}>
        <img className={classes.logoAPHP} src={logoAPHP} alt="Footer" />
      </a>
    </Grid>
  )
}

export default Footer
