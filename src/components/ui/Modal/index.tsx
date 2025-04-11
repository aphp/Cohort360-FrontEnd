/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { PropsWithChildren } from 'react'

import { Button, Dialog, DialogActions, DialogTitle, Divider, Grid, Typography } from '@mui/material'
import { DialogContentWrapper } from './styles'

type ModalProps = {
  open: boolean
  title?: string
  width?: string
  color?: 'success' | 'secondary' | 'primary' | 'error' | 'warning' | 'info'
  readonly?: boolean
  submitText?: string
  cancelText?: string
  isError?: boolean
  onSubmit?: (value: any) => void
  onClose?: () => void
}

const Modal = ({
  children,
  title,
  open,
  width = '550px',
  color = 'primary',
  readonly = false,
  submitText = 'Valider',
  cancelText = 'Annuler',
  isError = false,
  onSubmit,
  onClose
}: PropsWithChildren<ModalProps>) => {
  return (
    <Dialog open={open} onClose={onClose}>
      {title && (
        <>
          <DialogTitle sx={{ padding: '25px 30px' }}>
            <Typography textTransform="uppercase" fontSize={20} fontWeight={700} textAlign="center" color={color}>
              {title}
            </Typography>
          </DialogTitle>
          <Grid container justifyContent="center">
            <Grid item xs={6}>
              <Divider />
            </Grid>
          </Grid>
        </>
      )}
      <DialogContentWrapper width={width} style={{ padding: '25px 30px' }}>
        {children}
      </DialogContentWrapper>
      {!readonly && (
        <DialogActions style={{ backgroundColor: '#00000011', padding: '10px 30px' }}>
          <Button color="info" onClick={onClose}>
            <Typography fontSize="15px" fontWeight="600" color="#5B5E63">
              {cancelText}
            </Typography>
          </Button>
          <Button disabled={isError} color={color} onClick={onSubmit}>
            <Typography fontSize="15px" fontWeight="900">
              {submitText}
            </Typography>
          </Button>
        </DialogActions>
      )}
      {readonly && (
        <DialogActions style={{ backgroundColor: '#00000011', padding: '10px 30px' }}>
          <Button color="info" onClick={onClose}>
            <Typography fontSize="15px" fontWeight="600" color="#5B5E63">
              {cancelText}
            </Typography>
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}

export default Modal
