import * as React from 'react'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'

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
      <DialogTitle id="alert-dialog-title">{'Commentaire'}</DialogTitle>
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
