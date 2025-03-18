import { Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { CohortsType, CohortsTypeLabel } from 'types/cohorts'
import { isChecked, toggleFilter } from 'utils/filters'

type CohortsTypesFilterProps = {
  value: CohortsType[]
  name: string
  disabled?: boolean
}

const CohortsTypesFilter = ({ name, value, disabled = false }: CohortsTypesFilterProps) => {
  const context = useContext(FormContext)
  const [cohortsType, setCohortsType] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, cohortsType)
  }, [cohortsType])

  return (
    <InputWrapper>
      <Typography variant="h3">Favoris :</Typography>
      <FormGroup
        row={true}
        onChange={(e) =>
          setCohortsType(toggleFilter(cohortsType, (e.target as HTMLInputElement).value) as CohortsType[])
        }
      >
        <FormControlLabel
          disabled={disabled}
          checked={isChecked(CohortsType.FAVORITE, cohortsType)}
          value={CohortsType.FAVORITE}
          control={<Checkbox color="secondary" />}
          label={CohortsTypeLabel.FAVORITE}
        />
        <FormControlLabel
          disabled={disabled}
          checked={isChecked(CohortsType.NOT_FAVORITE, cohortsType)}
          value={CohortsType.NOT_FAVORITE}
          control={<Checkbox color="secondary" />}
          label={CohortsTypeLabel.NOT_FAVORITE}
        />
      </FormGroup>
    </InputWrapper>
  )
}

export default CohortsTypesFilter
