import { Autocomplete, TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { LabelObject } from 'types/searchCriterias'
import { capitalizeFirstLetter } from 'utils/capitalize'

type PrescriptionTypesFilterProps = {
  value: LabelObject[]
  name: string
  allAdministrationTypes: string[]
}

const PrescriptionTypesFilter = ({ name, value, allAdministrationTypes }: PrescriptionTypesFilterProps) => {
  const context = useContext(FormContext)
  const [prescriptionTypes, setPrescriptionTypes] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, prescriptionTypes)
  }, [prescriptionTypes])

  return (
    <InputWrapper>
      <Typography variant="h3">Type de prescriptions :</Typography>
      <Autocomplete
        multiple
        onChange={(event, value) => {
          setPrescriptionTypes(value)
        }}
        options={allAdministrationTypes}
        value={prescriptionTypes}
        disableCloseOnSelect
        getOptionLabel={(prescriptionType: any) => capitalizeFirstLetter(prescriptionType.label)}
        renderOption={(props, prescriptionType: any) => (
          <li {...props}>{capitalizeFirstLetter(prescriptionType.label)}</li>
        )}
        renderInput={(params) => (
          <TextField {...params} label="Types de prescriptions" placeholder="Sélectionner type(s) de prescriptions" />
        )}
      />
    </InputWrapper>
  )
}

export default PrescriptionTypesFilter
