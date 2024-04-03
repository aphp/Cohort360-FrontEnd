import { Autocomplete, TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'

type DocStatusFilterProps = {
  name: string
  value: string[]
  docStatusesList: string[]
  disabled?: boolean
}

const DocStatusFilter = ({ name, value, docStatusesList, disabled = false }: DocStatusFilterProps) => {
  const context = useContext(FormContext)
  const [docStatuses, setDocStatus] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, docStatuses)
  }, [docStatuses])

  return (
    <InputWrapper>
      <Typography variant="h3">Statut de documents :</Typography>
      <Autocomplete
        disableCloseOnSelect
        disabled={disabled}
        multiple
        onChange={(event, val) => {
          setDocStatus(val)
        }}
        options={docStatusesList}
        value={docStatuses}
        renderInput={(params) => <TextField {...params} placeholder="Statut de documents" />}
      />
    </InputWrapper>
  )
}

export default DocStatusFilter
