import React, { PropsWithChildren, ReactNode } from 'react'
import { Grid, Button, Drawer, Typography, Paper } from '@mui/material'

type RightPanelProps = {
  open: boolean
  anchor?: 'right' | 'left' | 'top' | 'bottom'
  title?: string
  mandatory?: boolean
  children: ReactNode
  onConfirm: () => void
  onClose: () => void
}

const Panel = ({
  open,
  title,
  anchor = 'right',
  mandatory = false,
  children,
  onConfirm,
  onClose
}: PropsWithChildren<RightPanelProps>) => {
  return (
    <Drawer
      anchor={anchor}
      open={open}
      PaperProps={{ style: { width: '650px' } }}
      onClose={onClose}
      sx={{ zIndex: 1300, overflowY: 'unset' }}
    >
      <Grid container direction="column" maxWidth="650px" height="100%" flexWrap="nowrap">
        <Grid item container flexDirection="column" height="100%" flexWrap="nowrap" overflow="auto">
          <Paper>
            <Grid container justifyContent="center" width="100%">
              {title && (
                <Typography fontSize="22px" margin="12px 0px" style={{ color: '34F4F4f' }}>
                  {title}
                </Typography>
              )}
            </Grid>
          </Paper>

          {children}
        </Grid>
        <Grid
          container
          item
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
          width="100%"
          padding="12px"
          borderTop="1px solid grey"
        >
          <Grid item xs={4} container justifyContent="space-between">
            <Button onClick={onClose} variant="outlined">
              Annuler
            </Button>
            <Button disabled={mandatory} onClick={onConfirm} variant="contained">
              Confirmer
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Drawer>
  )
}

export default Panel
