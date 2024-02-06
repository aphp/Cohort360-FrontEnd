import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material'

type FormDetailsDialogProps = {
  title: string
  content: any[]
  onClose: () => void
}

const FormDetailsDialog = ({ title, content, onClose }: FormDetailsDialogProps) => {
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {content.map((row, index) => (
          <Grid container key={index}>
            <Grid container item xs={6}>
              {row.name}
            </Grid>
            <Grid container item xs={6}>
              {row.value}
            </Grid>
          </Grid>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  )
}

export default FormDetailsDialog
