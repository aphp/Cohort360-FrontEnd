import { Autocomplete, TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { HierarchyElement } from 'types'
import { LabelObject } from 'types/searchCriterias'
import { capitalizeFirstLetter } from 'utils/capitalize'

type AdministrationTypesFilterProps = {
  value: LabelObject[]
  name: string
  allAdministrationTypes: HierarchyElement[]
  disabled?: boolean
}

const AdministrationTypesFilter = ({
  name,
  value,
  allAdministrationTypes,
  disabled = false
}: AdministrationTypesFilterProps) => {
  const context = useContext(FormContext)
  const [administrationTypes, setAdministrationTypes] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, administrationTypes)
  }, [administrationTypes])

  return (
    <InputWrapper>
      <Typography variant="h3">Voie d'administration :</Typography>
      <Autocomplete
        disabled={disabled}
        multiple
        onChange={(event, value) => {
          setAdministrationTypes(value)
        }}
        options={allAdministrationTypes}
        value={administrationTypes}
        disableCloseOnSelect
        getOptionLabel={(administrationRoute: any) => capitalizeFirstLetter(administrationRoute.label)}
        renderOption={(props, administrationRoute: any) => (
          <li {...props}>{capitalizeFirstLetter(administrationRoute.label)}</li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Voie d'administration"
            placeholder="Sélectionner une ou plusieurs voie d'administration"
          />
        )}
      />
    </InputWrapper>
  )
}

export default AdministrationTypesFilter
