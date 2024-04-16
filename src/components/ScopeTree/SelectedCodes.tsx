import React, { useState } from 'react'

import { Collapse, Grid, IconButton, Typography } from '@mui/material'
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
    <Grid container>
      <Grid item xs={12} container justifyContent="space-between">
        <Grid item xs={4} container>
          <Typography textAlign="center" padding="10px" fontWeight={900} color="#0063AF">
            {values?.length} sélectionné(s)
          </Typography>
        </Grid>
        <Grid item xs={1} container justifyContent="flex-end">
          {values.length > 0 && (
            <IconButton style={{ color: '#153D8A' }} onClick={() => setOpenSelectedCodesDrawer((prev) => !prev)}>
              {openSelectedCodesDrawer ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          )}
        </Grid>
      </Grid>
      <Collapse in={openSelectedCodesDrawer}>
        <Grid
          item
          container
          xs={12}
          justifyContent="space-between"
          style={{ maxHeight: 200, overflowX: 'hidden', overflowY: 'auto' }}
        >
          {values?.length > 0 && (
            <Grid item xs={12} container marginBottom={3}>
              {values.map((code) => (
                <Chip
                  key={code.id}
                  style={{ backgroundColor: '#D1E2F4', color: '153D8A important!' }}
                  label={`${code.source_value} - ${code.name}`}
                  onDelete={() => onDelete(code)}
                />
              ))}
            </Grid>
          )}
        </Grid>
      </Collapse>
    </Grid>
  )
}

export default SelectedCodes
