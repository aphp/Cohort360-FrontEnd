import { Typography } from '@mui/material'
import AsyncAutocomplete from 'components/ui/Inputs/AsyncAutocomplete'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'

type UsersFilterProps<T> = {
  value?: T[]
  name: string
  disabled?: boolean
  onFetch: (text: string, signal: AbortSignal, noStar?: boolean) => Promise<any>
}

const UsersFilter = <T,>({ name, value, disabled = false, onFetch }: UsersFilterProps<T>) => {
  const context = useContext(FormContext)
  const [user, setUser] = useState(value || [])

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, user)
  }, [user])

  return (
    <InputWrapper>
      <Typography variant="h3">Utilisateurs à qui partager la requête :</Typography>
      <AsyncAutocomplete
        disabled={disabled}
        label="Rechercher un utilisateur"
        variant="outlined"
        noOptionsText="Rechercher un utilisateur"
        values={value}
        onFetch={(text, signal) => onFetch(text, signal, false)}
        onChange={(newValue) => {
          setUser(newValue)
        }}
      />
    </InputWrapper>
  )
}

export default UsersFilter
