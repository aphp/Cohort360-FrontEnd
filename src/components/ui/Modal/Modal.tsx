import React, { PropsWithChildren, createContext, useState } from 'react'

import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material'
import { DialogContentWrapper } from './style'
import { FormContextType } from 'types/form'

export const FormContext = createContext<FormContextType | null>(null)

type ModalProps = {
  open: boolean
  title?: string
  width?: string
  noActions?: boolean
  onSubmit?: (value: any) => void
  onClose?: () => void
}

const Modal = ({
  children,
  title,
  open,
  width = '400px',
  noActions = false,
  onSubmit,
  onClose
}: PropsWithChildren<ModalProps>) => {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isError, setIsError] = useState(false)

  const updateFormData = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const updateError = (isError: boolean) => {
    setIsError(isError)
  }

  const handleSubmit = () => {
    if (onSubmit) onSubmit(formData)
  }
  return (
    <FormContext.Provider value={{ updateFormData, updateError }}>
      <Dialog open={open} onClose={onClose}>
        {title && <DialogTitle>{title}</DialogTitle>}
        <DialogContentWrapper width={width}>{children}</DialogContentWrapper>
        {!noActions && (
          <DialogActions>
            <Button color="info" onClick={onClose}>
              Annuler
            </Button>
            <Button
              disabled={isError}
              onClick={() => {
                handleSubmit()
                if (onClose) onClose()
              }}
            >
              Valider
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </FormContext.Provider>
  )
}

export default Modal
