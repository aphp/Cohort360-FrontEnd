import React from 'react'
import { useDispatch } from 'react-redux'

import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

import { useAppSelector } from 'state'
import { clearMessage, MessageState } from 'state/message'

const Cohort360_Snackbar = () => {
  const { message } = useAppSelector<{ message: MessageState }>((state) => ({ message: state.message }))
  const dispatch = useDispatch()

  const content: string = message ? message.content : ''
  const type: 'success' | 'error' | 'warning' | 'info' | undefined = message ? message.type : undefined

  const onClose = () => {
    dispatch(clearMessage())
  }

  return (
    <Snackbar
      open={content !== ''}
      autoHideDuration={3500}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={onClose} color="success" severity={type}>
        {content}
      </Alert>
    </Snackbar>
  )
}

export default Cohort360_Snackbar
