import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, CircularProgress } from '@mui/material'

import { RequestType, Provider, SimpleStatus } from 'types'

import { useAppSelector } from 'state'
import { RequestState } from 'state/request'

import RequestShareForm from './components/RequestShareForm'
import useStyles from './styles'
import services from 'services/aphp'

const ERROR_TITLE = 'error_title'
const ERROR_USER_SHARE_LIST = 'error_user_share_list'

const ModalShareRequest: React.FC<{
  requestShare?: RequestType | null
  shareSuccessOrFailMessage?: SimpleStatus
  parentStateSetter: (val: SimpleStatus) => void
  onClose: () => void
}> = ({ requestShare, onClose, parentStateSetter }) => {
  const { requestState } = useAppSelector<{ requestState: RequestState }>((state) => ({ requestState: state.request }))
  const navigate = useNavigate()
  const { classes } = useStyles()
  const { selectedRequestShare } = requestState

  const selectedCurrentRequest = selectedRequestShare || requestShare
  const [loading, setLoading] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<RequestType | null | undefined>(selectedCurrentRequest)
  const [currentUserToShare, setCurrentUserToShare] = useState<Provider[] | null>(null)
  const [error, setError] = useState<'error_title' | 'error_user_share_list' | null>(null)
  const [shareMessage, setShareMessage] = useState<SimpleStatus>(null)

  useEffect(() => {
    parentStateSetter(shareMessage)
  }, [parentStateSetter, shareMessage])

  const _onChangeValue = (key: 'name' | 'requestName' | 'usersToShare', value: string | string | Provider[]) => {
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

    const shareRequestResponse = await services.projects.shareRequest(currentRequest)
    if (shareRequestResponse.status === 201) {
      setShareMessage('success')
    } else {
      setShareMessage('error')
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
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
            className={classes.inputContainer}
          >
            <CircularProgress />
          </Grid>
        ) : (
          <RequestShareForm currentRequest={currentRequest} onChangeValue={_onChangeValue} error={error} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button onClick={handleConfirm}>Valider</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalShareRequest
