import React, { RefObject, useEffect, useRef, useState } from 'react'

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

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  useOutsideAlerter(wrapperRef, (event: any) => {
    if (openSelectedCodesDrawer && wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setOpenSelectedCodesDrawer(false)
    }
  })

  return (
    <Grid container ref={wrapperRef}>
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
      <Grid item xs={12} container justifyContent="space-between">
        <Grid item xs={4} container>
          <Typography textAlign="center" padding="10px" fontWeight={900} color="#0063AF">
            {values?.length} sélectionné(s)
          </Typography>
        </Grid>
        <Grid item xs={1} container justifyContent="flex-end">
          {values.length > 0 && (
            <IconButton style={{ color: '#153D8A' }} onClick={() => setOpenSelectedCodesDrawer((prev) => !prev)}>
              {openSelectedCodesDrawer ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
            </IconButton>
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SelectedCodes

function useOutsideAlerter(ref: RefObject<HTMLElement | null>, action: (event: Event) => void) {
  useEffect(() => {
    // Bind the event listener
    document.addEventListener('mousedown', action)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', action)
    }
  }, [ref, action])
}
