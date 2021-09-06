import React, { useState } from 'react'
import { useAppSelector } from 'state'

import { Button, CssBaseline, Grid, MenuItem, Select, TextField, Typography } from '@material-ui/core'

import useStyles from './styles'
import clsx from 'clsx'

const defaultContactRequest = {
  requestType: '',
  object: '',
  message: ''
}

const requestTypes = ["Demande d'assistance", "Suggestion d'amélioration", 'Notification de bug', 'Autre']

const ERROR_REQUEST_TYPE = 'error_request_type'
const ERROR_OBJECT = 'error_object'
const ERROR_MESSAGE = 'error_message'

const Contact: React.FC = () => {
  const classes = useStyles()
  const { practitioner, open } = useAppSelector((state) => ({
    practitioner: state.me,
    open: state.drawer
  }))

  const [contactRequest, setContactRequest] = useState(defaultContactRequest)
  const [error, setError] = useState<typeof ERROR_REQUEST_TYPE | typeof ERROR_OBJECT | typeof ERROR_MESSAGE | null>(
    null
  )

  const _onChangeValue = (key: 'requestType' | 'object' | 'message', value: any) => {
    const _contactRequest = { ...contactRequest }
    _contactRequest[key] = value
    setContactRequest(_contactRequest)
  }

  const onSubmit = () => {
    if (!contactRequest.requestType) {
      return setError(ERROR_REQUEST_TYPE)
    }

    if (!contactRequest.object) {
      return setError(ERROR_OBJECT)
    }

    if (!contactRequest.message) {
      return setError(ERROR_MESSAGE)
    }

    const contactSubmitForm = {
      lastname: practitioner?.lastName,
      firstname: practitioner?.firstName,
      idAPH: practitioner?.userName,
      ...contactRequest
    }

    console.log('Formulaire envoyé!', contactSubmitForm)
  }

  return (
    <Grid container direction="column" className={clsx(classes.appBar, { [classes.appBarShift]: open })}>
      <Grid container direction="column" alignItems="center" style={{ paddingTop: 80 }}>
        <CssBaseline />
        <Grid container item direction="column" xs={12} sm={9}>
          <Typography variant="h2" style={{ marginBottom: 24 }}>
            Contactez l'équipe Cohort360 :
          </Typography>

          <Typography variant="h3">Motif de contact :</Typography>
          <Select
            value={contactRequest.requestType}
            onChange={(event) => _onChangeValue('requestType', event.target.value as string)}
            variant="outlined"
            style={{ marginTop: 16, marginBottom: 24, backgroundColor: 'white' }}
            error={error === ERROR_REQUEST_TYPE}
          >
            {requestTypes.map((requestType, index) => (
              <MenuItem key={index} value={requestType}>
                {requestType}
              </MenuItem>
            ))}
          </Select>

          <Typography variant="h3">Objet :</Typography>
          <TextField
            placeholder="Objet"
            value={contactRequest.object}
            onChange={(event) => _onChangeValue('object', event.target.value)}
            margin="normal"
            variant="outlined"
            fullWidth
            style={{ marginBottom: 24, backgroundColor: 'white' }}
            error={error === ERROR_OBJECT}
          />

          <Typography variant="h3">Message :</Typography>
          <TextField
            placeholder="Écrivez votre message ici..."
            value={contactRequest.message}
            onChange={(event) => _onChangeValue('message', event.target.value)}
            margin="normal"
            variant="outlined"
            fullWidth
            multiline
            rows={5}
            rowsMax={8}
            style={{ backgroundColor: 'white', marginBottom: 24 }}
            error={error === ERROR_MESSAGE}
          />

          {error && <Typography color="secondary">Tous les champs sont obligatoires.</Typography>}

          <Button variant="contained" disableElevation onClick={onSubmit} className={classes.validateButton}>
            Valider
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Contact
