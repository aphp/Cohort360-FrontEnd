import React, { useContext, useEffect, useState } from 'react'
import { Autocomplete, TextField, Typography } from '@mui/material'
import { FormContext } from 'components/ui/Modal'
import { LabelObject } from 'types/searchCriterias'
import { InputWrapper } from 'components/ui/Inputs'

type EncounterStatusFilterProps = {
  name: string
  encounterStatusList: LabelObject[]
  value: LabelObject[]
  disabled?: boolean
}

const EncounterStatusFilter = ({ name, value, encounterStatusList, disabled = false }: EncounterStatusFilterProps) => {
  const context = useContext(FormContext)
  const [encounterStatus, setEncounterStatus] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, encounterStatus)
  }, [encounterStatus])

  return (
    <InputWrapper>
      <Typography variant="h3">Statut de la visite associée :</Typography>
      <Autocomplete
        disabled={disabled}
        multiple
        onChange={(event, value) => {
          setEncounterStatus(value)
        }}
        options={encounterStatusList}
        value={encounterStatus}
        disableCloseOnSelect
        getOptionLabel={(encounterStatus: LabelObject) => encounterStatus.label}
        renderOption={(props, encounterStatus: LabelObject) => <li {...props}>{encounterStatus.label}</li>}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Statut de la visite associée"
            placeholder="Sélectionner le statut de la visite associée"
          />
        )}
      />
    </InputWrapper>
  )
}

export default EncounterStatusFilter
