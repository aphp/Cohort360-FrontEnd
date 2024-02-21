import { Typography } from '@mui/material'
import AsyncAutocomplete from 'components/ui/Inputs/AsyncAutocomplete'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { LabelObject } from 'types/searchCriterias'

type UsersFilterProps = {
  name: string
  disabled?: boolean
  onFetch: (text: string, signal: AbortSignal, noStar?: boolean) => Promise<any>
}

const UsersFilter = ({ name, disabled = false, onFetch }: UsersFilterProps) => {
  const context = useContext(FormContext)
  const [users, setUsers] = useState<LabelObject[]>([])

  useEffect(() => {
    context?.updateError(false)
    if (context?.updateFormData) context.updateFormData(name, users)
    if (!users.length) context?.updateError(true)
  }, [users])

  return (
    <InputWrapper>
      <Typography variant="h3">Utilisateurs à qui partager la requête :</Typography>
      <AsyncAutocomplete
        disabled={disabled}
        label="Rechercher un utilisateur"
        variant="outlined"
        noOptionsText="Rechercher un utilisateur"
        onFetch={(text, signal) => onFetch(text, signal, false)}
        onChange={(newValue) => {
          setUsers(newValue)
        }}
      />
    </InputWrapper>
  )
}

export default UsersFilter
