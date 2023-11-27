import React, { PropsWithChildren, createContext, useState } from 'react'

import { Button, Dialog, DialogActions, DialogTitle, Typography } from '@mui/material'
import { DialogContentWrapper } from './styles'
import { FormContextType } from 'types/form'

export const FormContext = createContext<FormContextType | null>(null)

type ModalProps = {
  open: boolean
  title?: string
  width?: string
  noActions?: boolean
  readonly?: boolean
  validationText?: string
  onSubmit?: (value: any) => void
  onClose?: () => void
}

const Modal = ({
  children,
  title,
  open,
  width = '450px',
  noActions = false,
  readonly = false,
  validationText = 'Valider',
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
        {title && (
          <DialogTitle sx={{ color: '#FC2E8F', textTransform: 'uppercase', fontSize: 20 }}>{title}</DialogTitle>
        )}
        <DialogContentWrapper width={width}>{children}</DialogContentWrapper>
        {!noActions &&
          (!readonly ? (
            <DialogActions>
              <Button color="info" onClick={onClose}>
                <Typography fontSize="15px" fontWeight="500">
                  Annuler
                </Typography>
              </Button>
              <Button
                disabled={isError}
                color="secondary"
                onClick={() => {
                  handleSubmit()
                  if (onClose) onClose()
                }}
              >
                <Typography fontSize="15px" fontWeight="900">
                  {validationText}
                </Typography>
              </Button>
            </DialogActions>
          ) : (
            <DialogActions>
              <Button color="primary" onClick={onClose}>
                <Typography fontSize="15px" fontWeight="900">
                  Retour
                </Typography>
              </Button>
            </DialogActions>
          ))}
      </Dialog>
    </FormContext.Provider>
  )
}

export default Modal
