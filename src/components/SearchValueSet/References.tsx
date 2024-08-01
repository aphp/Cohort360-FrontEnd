import React from 'react'

import { Checkbox, FormControlLabel, Grid, Paper, Radio, Typography } from '@mui/material'
import { Reference } from 'types/searchValueSet'
import { Check, Warning } from '@mui/icons-material'
import { InputWrapper } from 'components/ui/Inputs'

export enum Type {
  SINGLE,
  MULTIPLE
}

type ReferencesProps = {
  type: Type
  values: Reference[]
  onSelect: (ref: Reference) => void
}

const ReferencesParameters = ({ values, onSelect, type }: ReferencesProps) => {
  return (
    <Grid padding="5px">
      <Grid item marginBottom={1}>
        <InputWrapper>
          <Typography color="#0063AF" variant="h3">
            Référentiels :
          </Typography>
        </InputWrapper>
      </Grid>
      <Grid item>
        {values.map((ref) => (
          <>
            <FormControlLabel
              key={ref.id}
              control={
                type === Type.MULTIPLE ? (
                  <Checkbox checked={ref.checked} onChange={() => onSelect(ref)} />
                ) : (
                  /*ref.isHierarchy ? (*/
                  <Radio checked={ref.checked} onChange={() => onSelect(ref)} />
                )
                /*) : (
                  <Radio disabled checked={ref.checked} onChange={() => handleSelectReference(ref.id)} />
                )*/
              }
              label={
                <Grid container alignItems="center">
                  {ref.label}
                  {ref.standard ? (
                    <Check fontSize="small" style={{ color: 'green', fontSize: 13, marginLeft: 2 }} />
                  ) : (
                    <Warning style={{ color: 'orange', fontSize: 14, marginLeft: 2 }} />
                  )}
                </Grid>
              }
            />
          </>
        ))}
      </Grid>
    </Grid>
  )
}

export default ReferencesParameters
