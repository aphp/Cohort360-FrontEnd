import React, { useContext, useEffect, useState } from 'react'
import { Autocomplete, TextField, Typography } from '@mui/material'
import { FormContext } from 'components/ui/Modal'
import { LabelObject } from 'types/searchCriterias'
import { InputWrapper } from 'components/ui/Inputs'

type ModalityFilterProps = {
  name: string
  modalitiesList: LabelObject[]
  value: LabelObject[]
}

const ModalityFilter = ({ name, value, modalitiesList }: ModalityFilterProps) => {
  const context = useContext(FormContext)
  const [modalities, setModalities] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, modalities)
  }, [modalities])

  return (
    <InputWrapper>
      <Typography variant="h3">Modalités :</Typography>
      <Autocomplete
        multiple
        onChange={(event, value) => {
          setModalities(value)
        }}
        options={modalitiesList}
        value={modalities}
        disableCloseOnSelect
        getOptionLabel={(modality: LabelObject) => modality.label}
        renderOption={(props, modality: LabelObject) => <li {...props}>{modality.label}</li>}
        renderInput={(params) => <TextField {...params} label="Modalité" placeholder="Sélectionner modalité(s)" />}
      />
    </InputWrapper>
  )
}

export default ModalityFilter
