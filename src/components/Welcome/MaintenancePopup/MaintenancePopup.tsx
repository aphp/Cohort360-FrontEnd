import React from 'react'

import { Typography } from '@mui/material'

import Modal from 'components/ui/Modal'

type MaintenancePopupProps = {
  open: boolean
  onClose: () => void
}

const MaintenancePopup = ({ open, onClose }: MaintenancePopupProps) => {
  return (
    <Modal open={open} title="Maintenance" color="warning" readonly cancelText="Fermer" onClose={onClose}>
      <Typography textAlign="center">
        L'application est en phase de test et n'est pas opérationnelle. Merci de vous reconnecter plus tard.
      </Typography>
    </Modal>
  )
}

export default MaintenancePopup
