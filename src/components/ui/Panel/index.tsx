import React, { PropsWithChildren, ReactNode } from 'react'
import { Grid, Button, Drawer, Typography, Paper } from '@mui/material'

type RightPanelProps = {
  open: boolean
  anchor?: 'right' | 'left' | 'top' | 'bottom'
  title?: string
  mandatory?: boolean
  children: ReactNode
  size?: string
  onConfirm: () => void
  onClose: () => void
}

const Panel = ({
  open,
  title,
  anchor = 'right',
  mandatory = false,
  children,
  size = '650px',
  onConfirm,
  onClose
}: PropsWithChildren<RightPanelProps>) => {
  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      sx={{ zIndex: 1300, overflowY: 'unset' }}
      slotProps={{
        paper: { style: { width: size } }
      }}
    >
      <Grid container sx={{ flexDirection: "column", maxWidth: size, height: "100%", flexWrap: "nowrap" }}>
        <Grid container sx={{ flexDirection: "column", flexWrap: "nowrap", overflow: "auto" }}>
          <Paper>
            <Grid container sx={{ justifyContent: "center", width: "100%" }}>
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
          sx={{
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            width: "100%",
            padding: "12px",
            borderTop: "1px solid grey",
            marginTop: "auto"
          }}
        >
          <Grid size={{ xs: 4 }} container sx={{ justifyContent: "space-between" }}>
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
