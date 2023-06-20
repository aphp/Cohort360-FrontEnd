import React, { ReactElement, useState } from 'react'

import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material'
import { DialogContentWrapper } from './style'

type ModalProps<T> = {
  children: ReactElement
  open: boolean
  title: string
  data: T
  width?: string
  onSubmit: (value: T) => void
  onClose: () => void
}

const Modal = <T,>({ children, data, title, open, width = '400px', onSubmit, onClose }: ModalProps<T>) => {
  const [_data, setData] = useState<T>(data)
  return (
    <>
      {open && (
        <Dialog open onClose={onClose}>
          <DialogTitle>{title}</DialogTitle>
          <DialogContentWrapper width={width}>
            {React.cloneElement(children, { onChange: setData, data: _data })}
          </DialogContentWrapper>
          <DialogActions>
            <Button onClick={onClose}>Annuler</Button>
            <Button
              onClick={() => {
                onSubmit(_data)
                onClose()
              }} /*disabled={error}*/
            >
              Valider
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default Modal
