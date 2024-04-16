import React, { useState } from 'react'

import { Collapse, Grid, Typography } from '@mui/material'
import Chip from 'components/ui/Chip'
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material'
import { Hierarchy } from 'types/hierarchy'
import { v4 as uuidv4 } from 'uuid'

type SelectedCodesProps<T, S> = {
  values: Hierarchy<T, S>[]
  onDelete: (hierarchyElement: Hierarchy<T, S>) => void
}

const SelectedCodes = <T, S>({ values, onDelete }: SelectedCodesProps<T, S>) => {
  const [openSelectedCodesDrawer, setOpenSelectedCodesDrawer] = useState(false)

  return (
    <Grid container>
      <Grid item xs={12} container alignItems="center" justifyContent="space-between">
        <Grid item xs={4} container>
          <Typography textAlign="center" fontWeight={900} color="#0063AF">
            {values?.length} sélectionné(s)
          </Typography>
        </Grid>
        <Grid item xs={1} container justifyContent="flex-end">
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
      <Collapse in={openSelectedCodesDrawer}>
        <Grid
          item
          container
          xs={12}
          justifyContent="space-between"
          style={{ maxHeight: 200, overflowX: 'hidden', overflowY: 'auto' }}
        >
          {values?.length > 0 && (
            <Grid item xs={12} container marginTop={2}>
              {values.map((code) => (
                <Chip
                  key={uuidv4()}
                  style={{ backgroundColor: '#FFF' }}
                  label={code.label}
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
