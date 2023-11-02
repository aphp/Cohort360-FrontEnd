import { Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { GenderStatus, GenderStatusLabel } from 'types/searchCriterias'
import { isChecked, toggleFilter } from 'utils/filters'

type GendersFilterProps = {
  value: GenderStatus[]
  name: string
  disabled?: boolean
}

const GendersFilter = ({ name, value, disabled = false }: GendersFilterProps) => {
  const context = useContext(FormContext)
  const [genders, setGenders] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, genders)
  }, [genders])

  return (
    <InputWrapper>
      <Typography variant="h3">Genre :</Typography>
      <FormGroup
        row={true}
        onChange={(e) => setGenders(toggleFilter(genders, (e.target as HTMLInputElement).value) as GenderStatus[])}
      >
        <FormControlLabel
          disabled={disabled}
          checked={isChecked(GenderStatus.FEMALE, genders)}
          value={GenderStatus.FEMALE}
          control={<Checkbox color="secondary" />}
          label={GenderStatusLabel.FEMALE}
        />
        <FormControlLabel
          disabled={disabled}
          checked={isChecked(GenderStatus.MALE, genders)}
          value={GenderStatus.MALE}
          control={<Checkbox color="secondary" />}
          label={GenderStatusLabel.MALE}
        />
        <FormControlLabel
          disabled={disabled}
          checked={isChecked(GenderStatus.OTHER, genders)}
          value={GenderStatus.OTHER}
          control={<Checkbox color="secondary" />}
          label={GenderStatusLabel.OTHER}
        />
        <FormControlLabel
          disabled={disabled}
          checked={isChecked(GenderStatus.UNKNOWN, genders)}
          value={GenderStatus.UNKNOWN}
          control={<Checkbox color="secondary" />}
          label={GenderStatusLabel.UNKNOWN}
        />
      </FormGroup>
    </InputWrapper>
  )
}

export default GendersFilter
