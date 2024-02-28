import React from 'react'
import { Grid, Typography } from '@mui/material'

type FormDetailsDialogProps = {
  title: string
  content: any[]
  onClose: () => void
}

const FormDetailsDialog = ({ content }: FormDetailsDialogProps) => {
  return (
    // <Dialog open onClose={onClose}>
    //   <DialogTitle>{title}</DialogTitle>
    //   <DialogContent>
    <div>
      {content.map((row, index) => (
        <Grid container key={index} style={{ padding: '4px 0' }}>
          <Grid container item xs={6}>
            <Typography>{row.name}</Typography>
          </Grid>
          <Grid container item xs={6}>
            <Typography>{row.value}</Typography>
          </Grid>
        </Grid>
      ))}
    </div>
    //   </DialogContent>
    //   <DialogActions>
    //     <Button onClick={onClose}>Fermer</Button>
    //   </DialogActions>
    // </Dialog>
  )
}

export default FormDetailsDialog
