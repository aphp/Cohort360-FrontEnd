import React, { useState } from 'react'

import { Collapse, Grid, SxProps, Theme, Typography } from '@mui/material'
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material'
import { Hierarchy } from 'types/hierarchy'
import CodesWithSystems from './CodesWithSystems'

type SelectedCodesProps<T> = {
  values: Hierarchy<T>[]
  onDelete: (node: Hierarchy<T>) => void
  sx?: SxProps<Theme>
}

const SelectedCodes = <T,>({ values, onDelete, sx = { backgroundColor: '#D1E2F4' } }: SelectedCodesProps<T>) => {
  const [openSelectedCodesDrawer, setOpenSelectedCodesDrawer] = useState(false)

  return (
    <Grid
      sx={{
        ...sx,
        padding: '10px 30px'
      }}
    >
      {values.length > 0 && (
        <Collapse in={openSelectedCodesDrawer} style={{ width: '100%' }}>
          <Grid
            container
            size={12}
            sx={{ justifyContent: 'space-between' }}
            style={{
              maxHeight: 200,
              overflowX: 'hidden',
              overflowY: 'auto',
              marginBottom: 20
            }}
          >
            <CodesWithSystems codes={values} onDelete={onDelete} sx={{ backgroundColor: '#FFF' }} />
          </Grid>
        </Collapse>
      )}
      <Grid size={12} container sx={{ alignItems: 'center', justifyContent: 'space-between', height: 24 }}>
        <Typography textAlign="center" fontWeight={900} color="#0063AF">
          {values.length} sélectionné(s)
        </Typography>
        <Grid size={1} container sx={{ justifyContent: 'flex-end' }}>
          {values.length > 0 && (
            <>
              {openSelectedCodesDrawer ? (
                <KeyboardArrowDown onClick={() => setOpenSelectedCodesDrawer((prev) => !prev)} />
              ) : (
                <KeyboardArrowRight onClick={() => setOpenSelectedCodesDrawer((prev) => !prev)} />
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SelectedCodes
