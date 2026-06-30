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
        Bien que l'application paraisse opérationnelle, elle est toujours en maintenance. Merci de revenir plus tard.
      </Typography>
    </Modal>
  )
}

export default MaintenancePopup
