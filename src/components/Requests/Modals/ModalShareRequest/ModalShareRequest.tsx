import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

import { RequestType, User, SimpleStatus } from 'types'

import { useAppSelector } from 'state'

import RequestShareForm from './components/RequestShareForm'
import services from 'services/aphp'

const ERROR_TITLE = 'error_title'
const ERROR_USER_SHARE_LIST = 'error_user_share_list'

const ModalShareRequest: React.FC<{
  requestShare?: RequestType | null
  parentStateSetter: (val: SimpleStatus) => void
  onClose: () => void
}> = ({ requestShare, onClose, parentStateSetter }) => {
  const requestState = useAppSelector((state) => state.request)
  const navigate = useNavigate()
  const { selectedRequestShare } = requestState

  const selectedCurrentRequest = selectedRequestShare || requestShare
  const [loading, setLoading] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<RequestType | null | undefined>(selectedCurrentRequest)
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

    const shareRequestResponse = await services.projects.shareRequest(currentRequest, notifyByEmail)
    if (shareRequestResponse?.status === 201) {
      parentStateSetter('success')
    } else {
      parentStateSetter('error')
    }
    onClose()
  }

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose()
    } else {
      navigate('/home')
    }
  }

  return (
    <Dialog
      open
      onClose={() => onClose && typeof onClose === 'function' && onClose()}
      fullWidth
      maxWidth="md"
      aria-labelledby="form-dialog-title"
    >
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
        <Button color="secondary" onClick={handleClose}>
          Annuler
        </Button>
        <Button onClick={handleConfirm}>Valider</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalShareRequest
