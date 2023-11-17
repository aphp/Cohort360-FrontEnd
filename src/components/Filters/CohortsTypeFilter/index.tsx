import { FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { CohortsType, CohortsTypeLabel } from 'types/cohorts'

type CohortsTypesFilterProps = {
  value: CohortsType
  name: string
}

const CohortsTypesFilter = ({ name, value }: CohortsTypesFilterProps) => {
  const context = useContext(FormContext)
  const [cohortsType, setCohortsType] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, cohortsType)
  }, [cohortsType])

  return (
    <InputWrapper>
      <Typography variant="h3">Favoris :</Typography>
      <RadioGroup
        name="favorite"
        value={cohortsType}
        onChange={(event) => setCohortsType(event.target.value as CohortsType)}
        row={true}
      >
        <FormControlLabel value={CohortsType.ALL} control={<Radio color="secondary" />} label={CohortsTypeLabel.ALL} />
        <FormControlLabel
          value={CohortsType.FAVORITE}
          control={<Radio color="secondary" />}
          label={CohortsTypeLabel.FAVORITE}
        />
        <FormControlLabel
          value={CohortsType.NOT_FAVORITE}
          control={<Radio color="secondary" />}
          label={CohortsTypeLabel.NOT_FAVORITE}
        />
      </RadioGroup>
    </InputWrapper>
  )
}

export default CohortsTypesFilter
