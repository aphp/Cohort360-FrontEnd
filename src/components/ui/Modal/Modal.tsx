import React, { PropsWithChildren, ReactElement, ReactNode, createContext, useState } from 'react'

import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material'
import { DialogContentWrapper } from './style'
import { FormContextType } from 'types/form'

export const FormContext = createContext<FormContextType | null>(null)

type ModalProps = {
  open: boolean
  title?: string
  width?: string
  onSubmit?: (value: any) => void
  onClose?: () => void
}

const Modal = ({ children, title, open, width = '400px', onSubmit, onClose }: PropsWithChildren<ModalProps>) => {
  const [formData, setFormData] = useState<Record<string, any>>({})

  const updateFormData = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  const handleSubmit = () => {
    if (onSubmit) onSubmit(formData)
  }
  return (
    <FormContext.Provider value={{ updateFormData }}>
      <Dialog open={open} onClose={onClose}>
        {title && <DialogTitle>{title}</DialogTitle>}
        <DialogContentWrapper width={width}>{children}</DialogContentWrapper>
        {(onSubmit || onClose) && (
          <DialogActions>
            {onClose && <Button onClick={onClose}>Annuler</Button>}
            {onSubmit && Object.keys(formData).length > 0 && (
              <Button
                onClick={() => {
                  handleSubmit()
                  if (onClose) onClose()
                }}
              >
                Valider
              </Button>
            )}
          </DialogActions>
        )}
      </Dialog>
    </FormContext.Provider>
  )
}

export default Modal
