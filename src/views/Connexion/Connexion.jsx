import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import CircularProgress from '@material-ui/core/CircularProgress'

import Footer from 'components/Footer/Footer'
import NoRights from 'components/ErrorView/NoRights'

import logo from 'assets/images/logo-login.png'
import { login as loginAction } from 'state/me'
import { ACCES_TOKEN, REFRESH_TOKEN } from '../../constants'

import services from 'services'

import useStyles from './styles'

const ErrorDialog = ({ open, setErrorLogin }) => {
  const _setErrorLogin = () => {
    if (setErrorLogin && typeof setErrorLogin === 'function') {
      setErrorLogin(false)
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogContentText>Votre code APH ou votre mot de passe est incorrect</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={_setErrorLogin}>Ok</Button>
      </DialogActions>
    </Dialog>
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
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState(undefined)
  const [password, setPassword] = useState(undefined)
  const [noRights, setNoRights] = useState(false)
  const [errorLogin, setErrorLogin] = useState(false)
  const [open, setOpen] = useState(false)

  const getPractitionerData = async (lastConnection) => {
    if (
      typeof services?.practitioner?.fetchPractitioner !== 'function' ||
      typeof services.perimeters.fetchDeidentified !== 'function'
    ) {
      setLoading(false)
      return setErrorLogin(true)
    }

    const practitioner = await services.practitioner.fetchPractitioner(username)

    if (practitioner) {
      const deidentifiedInfos = await services.perimeters.fetchDeidentified(practitioner.id)

      dispatch(
        loginAction({
          ...practitioner,
          deidentified: deidentifiedInfos.deidentification,
          nominativeGroupsIds: deidentifiedInfos.nominativeGroupsIds,
          lastConnection
        })
      )

      const oldPath = localStorage.getItem('old-path')
      localStorage.removeItem('old-path')
      history.push(oldPath ?? '/accueil')
      setLoading(false)
    } else {
      setLoading(false)
      setErrorLogin(true)
    }
  }

  useEffect(() => {
    // Do not use localStorage.clear() because localStorage.getItem('old-path') is set for relaunch app with prev page
    localStorage.removeItem('user')
    localStorage.removeItem('exploredCohort')
    localStorage.removeItem('userCohorts')
    localStorage.removeItem('cohortCreation')
    localStorage.removeItem('medication')
    localStorage.removeItem('scope')
    localStorage.removeItem('project')
    localStorage.removeItem('cohort')
    localStorage.removeItem('request')
    localStorage.removeItem('pmsi')
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
  }, [])

  const login = async () => {
    try {
      if (loading) return
      setLoading(true)

      if (!username || !password) {
        setLoading(false)
        return setErrorLogin(true)
      }

      const response = await services.practitioner.authenticate(username, password)
      if (!response) {
        setLoading(false)
        return setErrorLogin(true)
      }

      const { status, data = {} } = response

      if (status === 200) {
        localStorage.setItem(ACCES_TOKEN, data.access)
        localStorage.setItem(REFRESH_TOKEN, data.refresh)

        const getPractitioner = await services.practitioner.fetchPractitioner(username)
        const getRights = await services.practitioner.fetchPractitionerRole(getPractitioner.id)

        if (getRights === undefined) {
          setNoRights(true)
        } else {
          const lastConnection = data.last_connection ? data.last_connection.modified_at : undefined
          getPractitionerData(lastConnection)
        }
      } else {
        setLoading(false)
        return setErrorLogin(true)
      }
    } catch (err) {
      setLoading(false)
      setErrorLogin(true)
    }
  }

  const _onSubmit = (e) => {
    e.preventDefault()
    login()
  }

  if (noRights == true) return <NoRights />

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
          justify="center"
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
                  id="Identifiant"
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
                  disabled={loading || !username || !password}
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                >
                  {loading ? <CircularProgress /> : 'Connexion'}
                </Button>
              </Grid>

              <Box mt={10} align="center">
                <Footer />
              </Box>
            </form>
          </Grid>
        </Grid>
      </Grid>

      <ErrorDialog open={errorLogin !== false} setErrorLogin={setErrorLogin} />
      <LegalMentionDialog open={open} setOpen={setOpen} />
    </>
  )
}

export default Login
