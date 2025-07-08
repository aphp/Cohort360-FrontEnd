import React, {
  KeyboardEvent as ReactKeyboardEvent,
  SyntheticEvent,
  UIEvent,
  useContext,
  useEffect,
  useState
} from 'react'
import { useNavigate } from 'react-router-dom'
import localforage from 'localforage'
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Link,
  Snackbar,
  TextField,
  Typography
} from '@mui/material'

import NoRights from 'components/ErrorView/NoRights'

import logo from 'assets/images/logo-login.png'
import logoAPHP from 'assets/images/logo-aphp.png'
import Keycloak from 'assets/icones/keycloak.svg?react'

import { useAppDispatch } from 'state'
import { MeState, login as loginAction } from 'state/me'
import { ACCESS_TOKEN, REFRESH_TOKEN } from 'constants.js'

import services from 'services/aphp'

import useStyles from './styles'
import { getDaysLeft } from 'utils/formatDate'
import { AccessExpiration, User } from 'types'
import { isAxiosError } from 'axios'
import { saveRights } from 'state/scope'
import { updatePerimeters } from './utils'
import { AppConfig } from 'config'

type ErrorSnackBarAlertProps = {
  open?: boolean
  setError?: (error: boolean) => void
  errorMessage?: string
}

const ErrorSnackBarAlert = ({ open, setError, errorMessage }: ErrorSnackBarAlertProps) => {
  const _setError = () => {
    if (setError) {
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

type LegalMentionDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

const LegalMentionDialog = ({ open, setOpen }: LegalMentionDialogProps) => {
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
  const navigate = useNavigate()
  const { classes, cx } = useStyles()
  const appConfig = useContext(AppConfig)
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [noRights, setNoRights] = useState(false)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [open, setOpen] = useState(false)
  const urlParams = new URLSearchParams(window.location.search)
  const [display_jwt_form, setDisplay_jwt_form] = useState(false)
  const oidcCode = urlParams.get('code')

  useEffect(() => {
    localforage.setItem('persist:root', '')
    if (oidcCode) login()
  }, [])

  const loadBootstrapData = async (practitionerData: User, lastConnection: string) => {
    const maintenanceResponse = await services.practitioner.maintenance()

    if (maintenanceResponse.status !== 200 || isAxiosError(maintenanceResponse)) {
      setLoading(false)
      const mailSupport = appConfig.system.mailSupport
      return (
        setError(true),
        setErrorMessage(
          `Une erreur DJANGO est survenue. Si elle persiste, veuillez contacter le support au : ${mailSupport}.`
        )
      )
    }

    const maintenance = maintenanceResponse.data

    const accessExpirations = await services.perimeters
      .getAccessExpirations({ expiring: true })
      .then((values) => setLeftDays(values))

    await updatePerimeters(
      (nominativeGroupsIds, topLevelCareSites, practitionerPerimeters) => {
        const loginState: MeState = {
          id: practitionerData.username || '',
          userName: practitionerData.username || '',
          displayName: `${practitionerData.firstname} ${practitionerData.lastname}`,
          firstName: practitionerData.firstname || '',
          lastName: practitionerData.lastname || '',
          nominativeGroupsIds,
          topLevelCareSites,
          deidentified: nominativeGroupsIds.length === 0,
          lastConnection,
          maintenance,
          accessExpirations
        }
        dispatch(loginAction(loginState))
        dispatch(saveRights({ rights: practitionerPerimeters }))
        const oldPath = localStorage.getItem('old-path')
        localStorage.removeItem('old-path')
        navigate(oldPath ?? '/home')
      },
      (error) => {
        if (error.errorType === 'fhir') {
          setLoading(false)
          return (
            setError(true),
            setErrorMessage(
              `Une erreur FHIR est survenue. Si elle persiste, veuillez contacter le support au : ${appConfig.system.mailSupport}.`
            )
          )
        } else if (error.errorType === 'back') {
          setLoading(false)
          return (
            setError(true),
            setErrorMessage(
              `Une erreur DJANGO est survenue. Si elle persiste, veuillez contacter le support au : ${appConfig.system.mailSupport}.`
            )
          )
        } else if (error.errorType === 'noRight') {
          localStorage.clear()
          setLoading(false)
          return setNoRights(true)
        }
      }
    )
  }

  const setLeftDays = (accessExpirations: AccessExpiration[]) => {
    return accessExpirations
      .map((item) => {
        item.leftDays = getDaysLeft(item.end_datetime)
        return item
      })
      .sort((a, b) => {
        return a.leftDays - b.leftDays
      })
  }
  const login = async () => {
    if (loading) return
    setLoading(true)

    let response = null

    if (oidcCode) {
      localStorage.setItem('oidcAuth', 'true')
      response = await services.practitioner.authenticateWithCode(oidcCode)
    } else {
      if (!username || !password) {
        setLoading(false)
        return setError(true), setErrorMessage("L'un des champs nom d'utilisateur ou mot de passe est vide.")
      }
      if (username && password) {
        localStorage.setItem('oidcAuth', 'false')
        response = await services.practitioner.authenticateWithCredentials(username, password)
      }
    }

    if (!response || isAxiosError(response)) {
      setLoading(false)
      return (
        setError(true),
        setErrorMessage(
          `Erreur d'authentification. Si elle persiste, veuillez contacter le support au: ${appConfig.system.mailSupport}.`
        )
      )
    }

    const { status, data } = response

    if (status === 200) {
      localStorage.setItem(ACCESS_TOKEN, data.access_token)
      localStorage.setItem(REFRESH_TOKEN, data.refresh_token)

      const practitioner = data.user
      const lastConnection = data.last_login
      loadBootstrapData(practitioner, lastConnection)
    } else {
      setLoading(false)
      return setError(true), setErrorMessage("Votre nom d'utilisateur ou mot de passe est incorrect.")
    }
  }

  const _onSubmit = (event: UIEvent<HTMLElement>) => {
    event.preventDefault()
    login()
  }

  const oidcLogin = (event: SyntheticEvent) => {
    event.preventDefault()
    const oidcConfig = appConfig.system.oidc
    if (oidcConfig) {
      window.location.href =
        `${oidcConfig.issuer}?state=${oidcConfig.state}&` +
        `client_id=${oidcConfig.clientId}&` +
        `redirect_uri=${oidcConfig.redirectUri}&` +
        `response_type=${oidcConfig.responseType}&` +
        `scope=${oidcConfig.scope}`
    } else {
      setError(true)
      setErrorMessage('OIDC configuration is missing')
    }
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    event.key === 'Enter' ? _onSubmit(event) : null
  }

  useEffect(() => {
    const code_display_jwt = appConfig.system.codeDisplayJWT.split(',')
    let code_display_jwtPosition = 0

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === code_display_jwt[code_display_jwtPosition]) {
        code_display_jwtPosition++
      } else {
        code_display_jwtPosition = 0
      }
      if (code_display_jwtPosition === code_display_jwt.length) {
        setDisplay_jwt_form(!display_jwt_form)
        code_display_jwtPosition = 0
      }
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  }, [display_jwt_form])

  if (noRights) return <NoRights oidcCode={oidcCode} />

  return oidcCode ? (
    <Grid className={classes.oidcConnexionProgress}>
      <Typography variant="h2" color="primary">
        Connexion...
      </Typography>
      <CircularProgress />
      <ErrorSnackBarAlert open={error} setError={setError} errorMessage={errorMessage} />
    </Grid>
  ) : (
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
          justifyContent="center"
          alignItems="center"
          className={classes.rightPanel}
        >
          <Grid container xs={8} lg={6} item direction="column" alignItems="center" justifyContent="center">
            <img className={classes.logo} src={logo} alt="Logo Cohort360" />

            <Typography color="primary" className={classes.bienvenue}>
              Bienvenue ! Connectez-vous.
            </Typography>
            {display_jwt_form && (
              <Grid container direction="column" alignItems="center" justifyContent="center">
                <TextField
                  margin="normal"
                  required
                  style={{ width: '50%' }}
                  id="identifiant"
                  label="Identifiant"
                  name="Identifiant"
                  autoComplete="Identifiant"
                  autoFocus
                  onChange={(event) => setUsername(event.target.value)}
                  onKeyDown={onKeyDown}
                />

                <TextField
                  margin="normal"
                  required
                  style={{ width: '50%' }}
                  name="Votre mot de passe"
                  label="Votre mot de passe"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={onKeyDown}
                />

                <Button
                  type="submit"
                  onClick={_onSubmit}
                  variant="contained"
                  className={classes.submit}
                  id="connection-button-submit"
                >
                  {loading ? <CircularProgress /> : 'Connexion'}
                </Button>
              </Grid>
            )}

            <Button
              type="submit"
              onClick={oidcLogin}
              variant="contained"
              className={cx(classes.submit, classes.oidcButton)}
              style={{ marginBottom: 40 }}
              id="oidc-login"
              startIcon={<Keycloak height="25px" />}
            >
              Connexion via OIDC
            </Button>

            <Typography align="center">
              <Link href="#" onClick={() => setOpen(true)} underline="hover">
                En vous connectant, vous acceptez la mention légale.
              </Link>
            </Typography>
          </Grid>
          <Link href="https://eds.aphp.fr">
            <img src={logoAPHP} alt="Footer" />
          </Link>
        </Grid>
      </Grid>

      <ErrorSnackBarAlert open={error !== false} setError={setError} errorMessage={errorMessage} />

      <LegalMentionDialog open={open} setOpen={setOpen} />
    </>
  )
}

export default Login
