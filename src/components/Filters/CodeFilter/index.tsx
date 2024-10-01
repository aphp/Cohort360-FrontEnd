import { Typography } from '@mui/material'
import ValueSetField from 'components/SearchValueSet/ValueSetField'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { Hierarchy } from 'types/hierarchy'
import { FhirItem, Reference } from 'types/valueSet'

type CodeFilterProps = {
  value: Hierarchy<FhirItem>[]
  references: Reference[]
  name: string
  disabled?: boolean
}

const CodeFilter = ({ name, value, references, disabled = false }: CodeFilterProps) => {
  const context = useContext(FormContext)
  const [code, setCode] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, code)
  }, [code, name])

  return (
    <InputWrapper>
      <Typography variant="h3">Code :</Typography>
      <ValueSetField
        disabled={disabled}
        value={code}
        references={references}
        placeholder="Sélectionner des codes"
        onSelect={setCode}
      />
    </InputWrapper>
  )
}

export default CodeFilter
