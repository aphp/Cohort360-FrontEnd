/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { PropsWithChildren, createContext, useEffect, useState } from 'react'

import { Button, Dialog, DialogActions, DialogTitle, Divider, Grid, Typography } from '@mui/material'
import { DialogContentWrapper } from './styles'
import { FormContextType } from 'types/form'

export const FormContext = createContext<FormContextType | null>(null)

type ModalProps = {
  open: boolean
  title?: string
  width?: string
  color?: 'success' | 'secondary' | 'primary' | 'error' | 'warning' | 'info'
  noActions?: boolean
  readonly?: boolean
  validationText?: string
  onSubmit?: (value: any) => void
  onClean?: boolean
  onClose?: () => void
}

const Modal = ({
  children,
  title,
  open,
  width = '550px',
  color = 'primary',
  noActions = false,
  readonly = false,
  validationText = 'Valider',
  onSubmit,
  onClean,
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

  const deleteFormData = () => {
    setFormData({})
  }

  useEffect(() => {
    deleteFormData()
  }, [onClean])

  const submit = async () => {
    try {
      if (onSubmit) await onSubmit(formData)
      if (onClose) onClose()
    } catch {
      // Nothing to do if reaching here
    }
  }

  return (
    <FormContext.Provider value={{ updateFormData, updateError }}>
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
        {!noActions &&
          (!readonly ? (
            <DialogActions style={{ backgroundColor: '#00000011', padding: '10px 30px' }}>
              <Button color="info" onClick={onClose}>
                <Typography fontSize="15px" fontWeight="600" color="#5B5E63">
                  Annuler
                </Typography>
              </Button>
              <Button disabled={isError} color={color} onClick={submit}>
                <Typography fontSize="15px" fontWeight="900">
                  {validationText}
                </Typography>
              </Button>
            </DialogActions>
          ) : (
            <DialogActions style={{ backgroundColor: '#00000011', padding: '10px 30px' }}>
              <Button color={color} onClick={onClose}>
                <Typography fontSize="15px" fontWeight="600" color="#5B5E63">
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
