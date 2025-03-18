import React, { useEffect, useState } from 'react'
import { useAppDispatch } from 'state'
import { setMessage } from 'state/message'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  CircularProgress,
  Checkbox,
  FormControlLabel
} from '@mui/material'

import { RequestType, User } from 'types'

import RequestShareForm from './components/RequestShareForm'
import services from 'services/aphp'

const ERROR_TITLE = 'error_title'
const ERROR_USER_SHARE_LIST = 'error_user_share_list'

const ModalShareRequest: React.FC<{
  open: boolean
  requestToShare: RequestType
  onClose: () => void
}> = ({ open, requestToShare, onClose }) => {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<RequestType | null | undefined>(requestToShare)
  const [currentUserToShare, setCurrentUserToShare] = useState<User[] | null>(null)
  const [error, setError] = useState<'error_title' | 'error_user_share_list' | null>(null)
  const [notifyByEmail, setNotifyByEmail] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotifyByEmail(event.target.checked)
  }

  const _onChangeValue = (key: 'name' | 'requestName' | 'usersToShare' | 'usersAssociated', value: string | User[]) => {
    if (value && typeof value !== 'string') {
      setCurrentUserToShare(value)
    }
    setCurrentRequest((prevState) =>
      prevState ? { ...prevState, [key]: value } : { uuid: '', name: '', [key]: value }
    )
  }

  const handleConfirm = async () => {
    try {
      if (loading || currentRequest === null) return

      setLoading(true)
      if (
        (!currentRequest?.name && !currentRequest?.requestName) ||
        (currentRequest?.name && currentRequest?.name?.length > 255) ||
        (currentRequest?.requestName && currentRequest?.requestName?.length > 255)
      ) {
        setLoading(false)
        return setError(ERROR_TITLE)
      }

      if (!currentUserToShare) {
        setLoading(false)
        return setError(ERROR_USER_SHARE_LIST)
      }

      await services.projects.shareRequest(currentRequest, notifyByEmail)
      dispatch(
        setMessage({
          type: 'success',
          content: 'La requête a bien été partagée'
        })
      )
      setLoading(false)
      onClose()
    } catch (error) {
      setLoading(false)
      onClose()
      dispatch(
        setMessage({
          type: 'error',
          content: 'Une erreur est survenue lors du partage de la requête'
        })
      )
    }
  }

  useEffect(() => {
    if (open) setCurrentRequest(requestToShare)
  }, [open, requestToShare])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="form-dialog-title">
      <DialogTitle>Partager une requête</DialogTitle>
      <DialogContent>
        {currentRequest === null ? (
          <Grid container direction="column" justifyContent="center" alignItems="center" marginBottom={3}>
            <CircularProgress />
          </Grid>
        ) : (
          <RequestShareForm currentRequest={currentRequest} onChangeValue={_onChangeValue} error={error}>
            <FormControlLabel
              control={<Checkbox checked={notifyByEmail} onChange={handleChange} />}
              label="Envoyer un email au destinataire de la requête"
            />
          </RequestShareForm>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={handleConfirm}>Valider</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalShareRequest
