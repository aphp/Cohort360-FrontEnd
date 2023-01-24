import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import localforage from 'localforage'

import {
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Snackbar
} from '@material-ui/core'

import { Alert } from '@material-ui/lab'

import NoRights from 'components/ErrorView/NoRights'

import logo from 'assets/images/logo-login.png'
import logoAPHP from 'assets/images/logo-aphp.png'

import { useAppDispatch } from 'state'
import { login as loginAction } from 'state/me'
import { ACCES_TOKEN, REFRESH_TOKEN } from '../../constants'

import services from 'services'

import useStyles from './styles'

const ErrorSnackBarAlert = ({ open, setError, errorMessage }) => {
  const _setError = () => {
    if (setError && typeof setError === 'function') {
      setError(false)
    }
  }
  return (
    <Snackbar
      id="error-login-message"
      open={open}
      onClose={_setError}
      autoHideDuration={5000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert severity="error" onClose={_setError}>
        {errorMessage}
      </Alert>
    </Snackbar>
  )
}

const LegalMentionDialog = ({ open, setOpen }) => {
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

const Login = () => {
  const history = useHistory()
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState(undefined)
  const [password, setPassword] = useState(undefined)
  const [noRights, setNoRights] = useState(false)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [open, setOpen] = useState(false)

  React.useEffect(() => {
    localforage.setItem('persist:root', '')
  }, [])

  const getPractitionerData = async (practitioner, lastConnection, maintenance) => {
    if (practitioner) {
      const practitionerPerimeters = await services.perimeters.getPerimeters()

      if (practitionerPerimeters && practitionerPerimeters.errorType) {
        if (practitionerPerimeters.errorType === 'fhir') {
          setLoading(false)
          return (
            setError(true),
            setErrorMessage(
              'Une erreur FHIR est survenue. Si elle persiste, veuillez contacter le support au : dsi-id-recherche-support-cohort360@aphp.fr.'
            )
          )
        } else if (practitionerPerimeters.errorType === 'back') {
          setLoading(false)
          return (
            setError(true),
            setErrorMessage(
              'Une erreur DJANGO est survenue. Si elle persiste, veuillez contacter le support au : dsi-id-recherche-support-cohort360@aphp.fr.'
            )
          )
        }
      } else if (!practitionerPerimeters || !practitionerPerimeters.length || practitionerPerimeters.length === 0) {
        localStorage.clear()
        setLoading(false)
        return setNoRights(true)
      }

      const nominativeGroupsIds = practitionerPerimeters
        .filter(({ extension }) =>
          extension.some(({ url, valueString }) => url === 'READ_ACCESS' && valueString === 'DATA_NOMINATIVE')
        )
        .map((practitionerPerimeter) => {
          const groupId = practitionerPerimeter.extension?.find(({ url }) => url === 'cohort-id')
            ? `${practitionerPerimeter.extension?.find(({ url }) => url === 'cohort-id').valueInteger}`
            : ''
          return groupId
        })
        .filter((item) => item)

      dispatch(
        loginAction({
          ...practitioner,
          nominativeGroupsIds,
          deidentified: nominativeGroupsIds.length === 0,
          lastConnection,
          maintenance
        })
      )

      const oldPath = localStorage.getItem('old-path')
      localStorage.removeItem('old-path')
      history.push(oldPath ?? '/home')
    } else {
      setLoading(false)
      setError(true)
    }
  }

  const login = async () => {
    if (loading) return
    setLoading(true)

    if (!username || !password) {
      setLoading(false)
      return setError(true), setErrorMessage("L'un des champs nom d'utilisateur ou mot de passe est vide.")
    }

    const response = await services.practitioner.authenticate(username, password)

    if (!response) {
      setLoading(false)
      return (
        setError(true),
        setErrorMessage(
          'Une erreur DJANGO est survenue. Si elle persiste, veuillez contacter le support au : dsi-id-recherche-support-cohort360@aphp.fr.'
        )
      )
    }

    if (response.error) {
      setLoading(false)
      return (
        setError(true),
        setErrorMessage(
          'Une erreur DJANGO est survenue. Si elle persiste, veuillez contacter le support au : dsi-id-recherche-support-cohort360@aphp.fr.'
        )
      )
    }

    if (response.status !== 200) {
      setLoading(false)
      return (
        setError(true),
        setErrorMessage(
          'Une erreur DJANGO est survenue. Si elle persiste, veuillez contacter le support au : dsi-id-recherche-support-cohort360@aphp.fr.'
        )
      )
    }

    if (!response.data.jwt) {
      setLoading(false)
      return setError(true), setErrorMessage("Votre nom d'utilisateur ou votre mot de passe est incorrect.")
    }

    const { status, data = {} } = response

    if (status === 200) {
      localStorage.setItem(ACCES_TOKEN, data.jwt.access)
      localStorage.setItem(REFRESH_TOKEN, data.jwt.refresh)

      const practitioner = await services.practitioner.fetchPractitioner()

      if (!practitioner || practitioner.error || !practitioner.response || practitioner.response.status !== 200) {
        setLoading(false)
        return (
          setError(true),
          setErrorMessage(
            'Une erreur FHIR est survenue. Si elle persiste, veuillez contacter le support au : dsi-id-recherche-support-cohort360@aphp.fr.'
          )
        )
      }

      const lastConnection = data.jwt.last_connection ? data.jwt.last_connection.modified_at : undefined

      const maintenanceResponse = await services.practitioner.maintenance()

      if (maintenanceResponse.error || maintenanceResponse.status !== 200) {
        setLoading(false)
        return (
          setError(true),
          setErrorMessage(
            'Une erreur DJANGO est survenue. Si elle persiste, veuillez contacter le support au : dsi-id-recherche-support-cohort360@aphp.fr.'
          )
        )
      }

      const maintenance = maintenanceResponse.data
      getPractitionerData(practitioner, lastConnection, maintenance)
    } else {
      setLoading(false)
      return (
        setError(true),
        setErrorMessage(
          'Une erreur DJANGO est survenue. Si elle persiste, veuillez contacter le support au : dsi-id-recherche-support-cohort360@aphp.fr.'
        )
      )
    }
  }

  const _onSubmit = (e) => {
    e.preventDefault()
    login()
  }

  if (noRights === true) return <NoRights />

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
          elevation={6}
          direction="column"
          justifyContent="center"
          alignItems="center"
          className={classes.rightPanel}
        >
          <Grid container item xs={8} lg={6} direction="column" alignItems="center">
            <img className={classes.logo} src={logo} alt="Logo Cohort360" />

            <Typography color="primary" className={classes.bienvenue}>
              Bienvenue ! Connectez-vous.
            </Typography>

            <form className={classes.form} noValidate onSubmit={_onSubmit}>
              <Grid container item direction="column" alignItems="center">
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="identifiant"
                  label="Identifiant"
                  name="Identifiant"
                  autoComplete="Identifiant"
                  autoFocus
                  onChange={(event) => setUsername(event.target.value)}
                />

                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="Votre mot de passe"
                  label="Votre mot de passe"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                />

                <Typography align="center" className={classes.mention}>
                  <Link href="#" onClick={() => setOpen(true)}>
                    En cliquant sur &quot;connexion&quot;, vous acceptez la mention légale.
                  </Link>
                </Typography>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  id="connection-button-submit"
                >
                  {loading ? <CircularProgress /> : 'Connexion'}
                </Button>
              </Grid>

              <Box mt={10} align="center">
                <Grid container justifyContent="center">
                  <Link href="https://eds.aphp.fr">
                    <img className={classes.logoAPHP} src={logoAPHP} alt="Footer" />
                  </Link>
                </Grid>
              </Box>
            </form>
          </Grid>
        </Grid>
      </Grid>

      <ErrorSnackBarAlert open={error !== false} setError={setError} errorMessage={errorMessage} />

      <LegalMentionDialog open={open} setOpen={setOpen} />
    </>
  )
}

export default Login
