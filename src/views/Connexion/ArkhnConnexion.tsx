import React, { useState, useEffect } from 'react'

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Link,
  Typography
} from '@material-ui/core'
import { SerializedError, unwrapResult } from '@reduxjs/toolkit'
import { useHistory } from 'react-router-dom'
import queryString from 'query-string'

import logo from 'assets/images/logo-login.png'
import { ACCES_TOKEN, STATE_STORAGE_KEY } from '../../constants'
import { fetchTokens, removeTokens } from 'services/arkhnAuth/oauth/tokenManager'
import { arkhnAuthenticationRedirect } from 'services/authentication'
import { useAppDispatch } from 'state'
import { fetchPractitionerData } from 'state/me'

import useStyles from './styles'

const LoadingDialog = ({ open }: { open: boolean }) => (
  <Dialog open={open}>
    <CircularProgress />
  </Dialog>
)

const LegalMentionDialog = ({ open, setOpen }: { open: boolean; setOpen: (isOpen: boolean) => void }) => {
  const _setOpen = () => {
    if (setOpen && typeof setOpen === 'function') {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onClose={_setOpen}>
      <DialogTitle>Mention légale</DialogTitle>
      <DialogContent>
        <DialogContentText align="justify">
          L’usage de Cohort360 est soumis au respect des règles d’accès aux données de santé définies par la Commission
          Médicale d’Etablissement de l’AP-HP disponibles à l’adresse recherche-innovation.aphp.fr.
        </DialogContentText>
        <DialogContentText>
          En appuyant sur le bouton « OK », vous acceptez ces conditions d’utilisation. Les données relatives à votre
          connexion et à vos actions sur l’application (date, heure, type d’action), sont enregistrées et traitées pour
          des finalités de sécurité du système d’information et afin de réaliser des statistiques d’utilisation de
          l’application.
        </DialogContentText>
        <DialogContentText>
          Elles sont destinées à l’équipe projet de la DSI et sont conservées dans des fichiers de logs pendant 3 ans.
          Vous pouvez exercer votre droit d’accès et de rectification aux informations qui vous concernent, en écrivant
          à la déléguée à la protection des données de l’AP-HP à l’adresse protection.donnees.dsi@aphp.fr.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>OK</Button>
      </DialogActions>
    </Dialog>
  )
}

const ArkhnConnexion = () => {
  const history = useHistory()
  const dispatch = useAppDispatch()
  const { code, state } = queryString.parse(window.location.search)
  const [loading, setLoading] = useState(false)
  const [accessToken, setAccessToken] = useState(localStorage.getItem(ACCES_TOKEN))
  const storedState = localStorage.getItem(STATE_STORAGE_KEY)
  const classes = useStyles()
  const [open, setOpen] = useState(false)

  const changeToken = () => {
    fetchTokens().then(() => {
      setAccessToken(localStorage.getItem(ACCES_TOKEN))
    })
  }

  useEffect(() => {
    if (code && state && state === storedState) {
      changeToken()
      localStorage.removeItem(STATE_STORAGE_KEY)
    }
  }, [code, state, storedState])

  useEffect(() => {
    if (accessToken) {
      setLoading(true)
      dispatch(fetchPractitionerData())
        .then(unwrapResult)
        .then(() => {
          history.push('/accueil')
        })
        .catch((error: SerializedError) => {
          console.error(error)
          removeTokens()
          setLoading(false)
        })
    }
  }, [accessToken, dispatch, history])

  return (
    <>
      <Grid container component="main" className={classes.root}>
        <Grid item xs={false} sm={6} md={6} className={classes.image} />
        <Grid
          container
          item
          xs={12}
          sm={6}
          md={6}
          direction="column"
          justify="center"
          alignItems="center"
          className={classes.rightPanel}
        >
          <Grid container item xs={8} lg={6} direction="column" alignItems="center" justify="space-around">
            <Grid item>
              <img className={classes.logo} src={logo} alt="Logo Cohort360" />
              <Typography color="primary" className={classes.bienvenue}>
                Bienvenue ! Connectez-vous.
              </Typography>
            </Grid>
            <Grid item container alignItems="center" direction="column">
              <Typography align="center" className={classes.mention}>
                <Link href="#" onClick={() => setOpen(true)}>
                  En cliquant sur &quot;connexion&quot;, vous acceptez la mention légale.
                </Link>
              </Typography>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={arkhnAuthenticationRedirect}
              >
                Se connecter avec Arkhn
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <LoadingDialog open={loading} />
      <LegalMentionDialog open={open} setOpen={setOpen} />
    </>
  )
}

export default ArkhnConnexion
