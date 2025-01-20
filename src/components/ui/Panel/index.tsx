import React, { PropsWithChildren, ReactNode } from 'react'
import { Grid, Button, Drawer, Typography, Paper } from '@mui/material'

type RightPanelProps = {
  open: boolean
  anchor?: 'right' | 'left' | 'top' | 'bottom'
  title?: string
  mandatory?: boolean
  children: ReactNode
  cancelText?: string
  confirmText?: string
  onConfirm?: () => void
  onClose?: () => void
}

const Panel = ({
  open,
  title,
  anchor = 'right',
  mandatory = false,
  children,
  cancelText = 'Annuler',
  confirmText = 'Confirmer',
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
        <Grid item container flexDirection="column" flexWrap="nowrap" overflow="auto">
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
          marginTop={'auto'}
        >
          <Grid item xs={5} gap={1} container justifyContent="center">
            {onClose && (
              <Button onClick={onClose} variant="outlined">
                {cancelText}
              </Button>
            )}
            {onConfirm && (
              <Button disabled={mandatory} onClick={onConfirm} variant="contained">
                {confirmText}
              </Button>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Drawer>
  )
}

export default Panel
