import { Autocomplete, TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { ValueSet } from 'types'
import { capitalizeFirstLetter } from 'utils/capitalize'

type CohortStatusFilterProps = {
  value: ValueSet[]
  name: string
  allStatus: ValueSet[]
}

const CohortStatusFilter = ({ name, value, allStatus }: CohortStatusFilterProps) => {
  const context = useContext(FormContext)
  const [status, setStatus] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, status)
  }, [status])

  return (
    <InputWrapper>
      <Typography variant="h3">Statut :</Typography>
      <Autocomplete
        multiple
        onChange={(event, value) => {
          setStatus(value)
        }}
        options={allStatus}
        value={status}
        disableCloseOnSelect
        getOptionLabel={(status) => capitalizeFirstLetter(status.display)}
        renderOption={(props, status) => <li {...props}>{capitalizeFirstLetter(status.display)}</li>}
        renderInput={(params) => <TextField {...params} label="Statut" placeholder="Statut de la cohorte" />}
      />
    </InputWrapper>
  )
}

export default CohortStatusFilter
