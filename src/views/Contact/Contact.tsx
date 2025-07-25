import React, { useState } from 'react'

import {
  Alert,
  Button,
  CircularProgress,
  CssBaseline,
  Grid,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography
} from '@mui/material'
import PageContainer from 'components/ui/PageContainer'

import services from 'services/aphp'

import useStyles from './styles'

const defaultContactRequest = {
  requestType: '',
  object: '',
  url: '',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  files: FileList as any,
  message: ''
}

const requestTypes = [
  {
    label: "Demande d'assistance",
    code: 'Bug request'
  },
  {
    label: "Suggestion d'amélioration",
    code: 'Feature request'
  },
  {
    label: 'Autre',
    code: 'Other'
  }
]

const ERROR_REQUEST_TYPE = 'error_request_type'
const ERROR_OBJECT = 'error_object'
const ERROR_MESSAGE = 'error_message'

const Contact: React.FC = () => {
  const { classes } = useStyles()

  const [contactRequest, setContactRequest] = useState(defaultContactRequest)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<typeof ERROR_REQUEST_TYPE | typeof ERROR_OBJECT | typeof ERROR_MESSAGE | null>(
    null
  )
  const [errorFiles, setErrorFiles] = useState(false)
  const [createIssueSuccess, setCreateIssueSuccess] = useState(false)
  const [createIssueFail, setCreateIssueFail] = useState(false)

  const _onChangeValue = (
    key: 'requestType' | 'object' | 'url' | 'files' | 'message',
    value: string | FileList | null
  ) => {
    const _contactRequest = { ...contactRequest }
    _contactRequest[key] = value
    setContactRequest(_contactRequest)
  }

  const onSubmit = async () => {
    try {
      if (!contactRequest.requestType) {
        return setError(ERROR_REQUEST_TYPE)
      }

      if (!contactRequest.object) {
        return setError(ERROR_OBJECT)
      }

      if (!contactRequest.message) {
        return setError(ERROR_MESSAGE)
      }

      if (contactRequest.files?.[0] && contactRequest.files[0].size > 10000000) {
        return setErrorFiles(true)
      } else {
        setErrorFiles(false)
      }

      setLoading(true)

      const contactSubmitForm = new FormData()

      contactSubmitForm.append('label', contactRequest.requestType)
      contactSubmitForm.append('title', contactRequest.object)
      contactSubmitForm.append(
        'description',
        `${contactRequest.url !== '' ? `**URL concernée :** ${contactRequest.url}\n\n` : ''} ${contactRequest.message}`
      )
      if (contactRequest.files && contactRequest.files.length > 0) {
        contactSubmitForm.append('attachment', contactRequest.files[0])
      }

      const postIssueResp = await services.contact.postIssue(contactSubmitForm)

      setContactRequest(defaultContactRequest)
      setLoading(false)
      postIssueResp ? setCreateIssueSuccess(true) : setCreateIssueFail(true)
    } catch (error) {
      console.error('Erreur lors de la création du ticket', error)
      setContactRequest(defaultContactRequest)
      setLoading(false)
      setCreateIssueFail(true)
    }
  }

  return (
    <>
      <PageContainer>
        <Grid container direction="column" alignItems="center">
          <CssBaseline />
          <Grid container item direction="column" xs={11}>
            {loading ? (
              <CircularProgress size={60} className={classes.loading} />
            ) : (
              <>
                <Typography variant="h1" className={classes.title}>
                  Contactez l'équipe Cohort360
                </Typography>

                <Typography variant="h3">Motif de contact</Typography>
                <Select
                  required
                  value={contactRequest.requestType}
                  onChange={(event) => _onChangeValue('requestType', event.target.value as string)}
                  style={{ marginTop: 16, marginBottom: 24, backgroundColor: 'white' }}
                  error={error === ERROR_REQUEST_TYPE}
                >
                  {requestTypes.map((requestType, index) => (
                    <MenuItem key={index} value={requestType.code}>
                      {requestType.label}
                    </MenuItem>
                  ))}
                </Select>

                <Typography variant="h3">Objet</Typography>
                <TextField
                  required
                  placeholder="Objet"
                  value={contactRequest.object}
                  onChange={(event) => _onChangeValue('object', event.target.value)}
                  margin="normal"
                  fullWidth
                  style={{ marginBottom: 24, backgroundColor: 'white' }}
                  error={error === ERROR_OBJECT}
                />

                {contactRequest.requestType === requestTypes[0].code && (
                  <>
                    <Typography variant="h3">URL concernée</Typography>
                    <TextField
                      placeholder="Copiez-collez l'URL concernée par votre demande"
                      value={contactRequest.url}
                      onChange={(event) => _onChangeValue('url', event.target.value)}
                      margin="normal"
                      fullWidth
                      style={{ marginBottom: 24, backgroundColor: 'white' }}
                    />
                  </>
                )}

                <Typography variant="h3">Message</Typography>
                <TextField
                  required
                  placeholder="Écrivez votre message ici..."
                  value={contactRequest.message}
                  onChange={(event) => _onChangeValue('message', event.target.value)}
                  margin="normal"
                  fullWidth
                  multiline
                  minRows={5}
                  maxRows={8}
                  style={{ backgroundColor: 'white', marginBottom: 24 }}
                  error={error === ERROR_MESSAGE}
                />

                <Typography variant="h3">Pièce jointe</Typography>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    id="fileInput"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(event) => _onChangeValue('files', event.target?.files)}
                  />
                  <label htmlFor="fileInput">
                    <Button
                      variant="contained"
                      disableElevation
                      component="span"
                      className={classes.validateButton}
                      style={{ marginBottom: 24 }}
                    >
                      Parcourir...
                    </Button>
                  </label>
                  {contactRequest.files.length > 0 && (
                    <Typography style={{ marginLeft: 8 }}>{contactRequest.files[0].name}</Typography>
                  )}
                </div>

                {error && (
                  <Typography color="secondary">
                    Le motif de contact, l'objet et le message sont des champs obligatoires.
                  </Typography>
                )}
                {errorFiles && (
                  <Typography color="secondary">La pièce jointe ne doit pas dépasser les 10Mo.</Typography>
                )}

                <Button variant="contained" disableElevation onClick={onSubmit} className={classes.validateButton}>
                  Envoyer
                </Button>
              </>
            )}
          </Grid>
        </Grid>
      </PageContainer>

      {createIssueSuccess && (
        <Snackbar
          open
          onClose={() => setCreateIssueSuccess(false)}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={() => setCreateIssueSuccess(false)} className={classes.alert}>
            Votre demande a bien été transmise.
          </Alert>
        </Snackbar>
      )}
      {createIssueFail && (
        <Snackbar
          open
          onClose={() => setCreateIssueFail(false)}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="error" onClose={() => setCreateIssueFail(false)}>
            Une erreur s'est produite lors de la transmission de votre demande.
          </Alert>
        </Snackbar>
      )}
    </>
  )
}

export default Contact
