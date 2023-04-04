import * as React from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

type ModalAdministrationCommentProps = {
  open?: boolean
  comment?: string | null
  handleClose?: () => void
}

const ModalAdministrationComment: React.FC<ModalAdministrationCommentProps> = ({ open, comment, handleClose }) => {
  return (
    <Dialog
      open={!!open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Commentaire</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {comment && comment.length > 0
            ? comment
                .split('\n')
                .map((_comment: string, index: number) => <Typography key={index}>{_comment}</Typography>)
            : 'Commentaire indisponible'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalAdministrationComment
