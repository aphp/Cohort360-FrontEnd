import React from 'react'
import { Typography } from '@mui/material'
import ValueSetField from 'components/SearchValueSet/ValueSetField'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { Hierarchy } from 'types/hierarchy'
import { FhirItem, Reference } from 'types/valueSet'

type ValueSetsProps = {
  value: Hierarchy<FhirItem>[]
  label?: string
  references: Reference[]
  disabled?: boolean
  onChange: (valueSets: Hierarchy<FhirItem>[]) => void
}

const ValueSets = ({ label, value, references, disabled = false, onChange }: ValueSetsProps) => {
  return (
    <InputWrapper>
      {label && <Typography variant="h3">{label}</Typography>}
      <ValueSetField
        disabled={disabled}
        value={value}
        references={references}
        placeholder="Sélectionner des codes"
        onSelect={onChange}
      />
    </InputWrapper>
  )
}

export default ValueSets
