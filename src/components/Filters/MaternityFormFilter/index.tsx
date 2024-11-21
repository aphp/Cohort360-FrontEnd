import React, { useContext, useEffect, useState } from 'react'
import { Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import { FormNames } from 'types/searchCriterias'
import { isChecked, toggleFilter } from 'utils/filters'
import labels from 'labels.json'

type MaternityFormFilterProps = {
  value: FormNames[]
  name: string
  disabled?: boolean
}

const MaternityFormFilter = ({ name, value, disabled = false }: MaternityFormFilterProps) => {
  const context = useContext(FormContext)
  const [formName, setFormName] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, formName)
  }, [formName])

  return (
    <InputWrapper>
      <Typography variant="h3">Formulaire :</Typography>
      <FormGroup
        row={true}
        onChange={(e) => setFormName(toggleFilter(formName, (e.target as HTMLInputElement).value) as FormNames[])}
      >
        <FormControlLabel
          disabled={disabled}
          checked={isChecked(FormNames.PREGNANCY, formName)}
          value={FormNames.PREGNANCY}
          control={<Checkbox color="secondary" />}
          label={labels.formNames.pregnancy}
        />
        <FormControlLabel
          disabled={disabled}
          checked={isChecked(FormNames.HOSPIT, formName)}
          value={FormNames.HOSPIT}
          control={<Checkbox color="secondary" />}
          label={labels.formNames.hospit}
        />
      </FormGroup>
    </InputWrapper>
  )
}

export default MaternityFormFilter
