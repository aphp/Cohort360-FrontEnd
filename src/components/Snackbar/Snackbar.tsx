import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

import { useAppSelector } from 'state'
import { clearMessage, MessageState } from 'state/message'

type SnackbarTypeOfMessage = 'success' | 'error' | 'warning' | 'info' | undefined

const Cohort360_Snackbar = () => {
  const { message } = useAppSelector<{ message: MessageState }>((state) => ({ message: state.message }))
  const dispatch = useDispatch()

  const content: string = message ? message.content : ''
  const type: SnackbarTypeOfMessage = message ? message.type : undefined

  const [snackbarState, setSnackbarState] = useState<{ content: string; type: SnackbarTypeOfMessage }>({
    content: '',
    type: 'info'
  })

  useEffect(() => {
    setSnackbarState({ content, type })
    return () => {
      setSnackbarState({ content: '', type: 'info' })
    }
  }, [content, type])

  const onClose = () => {
    dispatch(clearMessage())
  }

  return (
    <Snackbar
      open={snackbarState.content !== ''}
      autoHideDuration={3500}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={onClose} color={snackbarState.type} severity={snackbarState.type}>
        {snackbarState.content}
      </Alert>
    </Snackbar>
  )
}

export default Cohort360_Snackbar
