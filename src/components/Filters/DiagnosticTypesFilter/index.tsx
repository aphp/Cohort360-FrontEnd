import { Autocomplete, TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { HierarchyElement } from 'types'
import { LabelObject } from 'types/searchCriterias'
import { capitalizeFirstLetter } from 'utils/capitalize'

type DiagnosticTypesFilterProps = {
  value: LabelObject[]
  name: string
  allDiagnosticTypesList: HierarchyElement[]
  disabled?: boolean
}

const DiagnosticTypesFilter = ({
  name,
  value,
  allDiagnosticTypesList,
  disabled = false
}: DiagnosticTypesFilterProps) => {
  const context = useContext(FormContext)
  const [diagnosticTypes, setDiagnosticTypes] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, diagnosticTypes)
  }, [diagnosticTypes])

  return (
    <InputWrapper>
      <Typography variant="h3">Type de diagnostics :</Typography>
      <Autocomplete
        disabled={disabled}
        multiple
        onChange={(event, value) => {
          setDiagnosticTypes(value)
        }}
        options={allDiagnosticTypesList}
        value={diagnosticTypes}
        disableCloseOnSelect
        getOptionLabel={(diagnosticType: any) => capitalizeFirstLetter(diagnosticType.label)}
        renderOption={(props, diagnosticType: any) => <li {...props}>{capitalizeFirstLetter(diagnosticType.label)}</li>}
        renderInput={(params) => (
          <TextField {...params} label="Types de diagnostics" placeholder="Sélectionner type(s) de diagnostics" />
        )}
      />
    </InputWrapper>
  )
}

export default DiagnosticTypesFilter
