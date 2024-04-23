import React, { useState } from 'react'

import { Grid, IconButton, Typography } from '@mui/material'
import Chip from 'components/ui/Chip'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import { ScopeElement } from 'types'
import { Hierarchy } from 'types/hierarchy'

type SelectedCodesProps<T> = {
  values: Hierarchy<ScopeElement, T>[]
  onDelete: (hierarchyElement: Hierarchy<ScopeElement, string>) => void
}

const SelectedCodes = <T,>({ values, onDelete }: SelectedCodesProps<T>) => {
  const [openSelectedCodesDrawer, setOpenSelectedCodesDrawer] = useState(false)

  return (
    <>
      {openSelectedCodesDrawer && (
        <Grid
          item
          container
          xs={12}
          justifyContent="space-between"
          style={{ maxHeight: 200, overflowX: 'hidden', overflowY: 'auto' }}
        >
          {values?.length > 0 && (
            <Grid item xs={12} container marginBottom={3} spacing={1}>
              {values.map((code) => (
                <Grid item xs={4} container key={code.id}>
                  <Chip label={`${code.source_value} - ${code.name}`} onDelete={() => onDelete(code)} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      )}
      <Grid item container xs={12} justifyContent="space-between">
        <Grid item xs={4} container>
          <Typography textAlign="center" padding="10px" fontWeight={900}>
            {values?.length} sélectionné(s)
          </Typography>
        </Grid>
        <Grid item xs={1} container justifyContent="flex-end">
          {values.length > 0 && (
            <IconButton onClick={() => setOpenSelectedCodesDrawer(!openSelectedCodesDrawer)}>
              {openSelectedCodesDrawer ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
            </IconButton>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default SelectedCodes
