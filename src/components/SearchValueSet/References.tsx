import React from 'react'

import { Checkbox, FormControlLabel, Grid, Radio } from '@mui/material'
import { Reference } from 'types/searchValueSet'
import { Check, Warning } from '@mui/icons-material'

export enum Type {
  SINGLE,
  MULTIPLE
}

type ReferencesProps = {
  type: Type
  values: Reference[]
  disabled?: boolean
  onSelect: (ref: Reference[]) => void
}

const ReferencesParameters = ({ values, type, disabled = false, onSelect }: ReferencesProps) => {
  const handleSelectReference = (id: string) => {
    const newReferences = values.map((ref) => ({
      ...ref,
      checked: type === Type.SINGLE ? id === ref.id : id === ref.id ? !ref.checked : ref.checked
    }))
    onSelect(newReferences)
  }

  return (
    <>
      {values.map((ref) => (
        <FormControlLabel
          disabled={disabled}
          key={ref.id}
          control={
            type === Type.MULTIPLE ? (
              <Checkbox checked={ref.checked} onChange={() => handleSelectReference(ref.id)} />
            ) : (
              <Radio checked={ref.checked} onChange={() => handleSelectReference(ref.id)} />
            )
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
      ))}
    </>
  )
}

export default ReferencesParameters
