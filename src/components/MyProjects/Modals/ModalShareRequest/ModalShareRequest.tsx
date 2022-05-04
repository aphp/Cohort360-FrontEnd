import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, CircularProgress } from '@material-ui/core'

import { RequestType, Provider } from 'types'

import { useAppSelector } from 'state'
import { RequestState } from 'state/request'

import RequestShareForm from './components/RequestShareForm'
import useStyles from './styles'
import services from 'services'

const ERROR_TITLE = 'error_title'
const ERROR_USER_SHARE_LIST = 'error_user_share_list'

const ModalShareRequest: React.FC<{
  requestShare?: RequestType | null
  onClose: () => void
}> = ({ requestShare, onClose }) => {
  const { requestState } = useAppSelector<{ requestState: RequestState }>((state) => ({ requestState: state.request }))
  const history = useHistory()
  const classes = useStyles()
  const { selectedRequestShare } = requestState
  const selectedCurrentRequest = selectedRequestShare || requestShare
  const [loading, setLoading] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<RequestType | null | undefined>(selectedCurrentRequest)
  const [currentUserToShare, setCurrentUserToShare] = useState<Provider[] | null>(null)
  const [error, setError] = useState<'error_title' | 'error_user_share_list' | null>(null)

  console.log('props passé a la modal de shareRequest par le state', selectedRequestShare)
  console.log('props passé a la modale par la props requestShare', requestShare)
  console.log('selectedCurrentRequest', selectedCurrentRequest)
  console.log('currentRequest', currentRequest)

  const _onChangeValue = (key: 'name' | 'usersToShare', value: string | Provider[]) => {
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
      !currentRequest?.name ||
      !currentRequest?.requestName ||
      (currentRequest?.name && currentRequest?.name.length > 255) ||
      (currentRequest?.requestName && currentRequest?.requestName.length > 255)
    ) {
      setLoading(false)
      return setError(ERROR_TITLE)
    }

    if (!currentUserToShare) {
      setLoading(false)
      return setError(ERROR_USER_SHARE_LIST)
    }
    await services.projects.shareRequest(currentRequest)
    onClose()
  }

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose()
    } else {
      history.push('/accueil')
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
