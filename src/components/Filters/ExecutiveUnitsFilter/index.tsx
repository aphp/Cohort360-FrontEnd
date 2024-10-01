import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { ScopeElement } from 'types'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'
import ExecutiveUnitsInput from 'components/ui/Inputs/ExecutiveUnits'

type ExecutiveUnitsFilterProps = {
  value: Hierarchy<ScopeElement, string>[]
  sourceType: SourceType
  name: string
  disabled?: boolean
}

const ExecutiveUnitsFilter = ({ name, value, sourceType, disabled = false }: ExecutiveUnitsFilterProps) => {
  const context = useContext(FormContext)
  const [population, setPopulation] = useState<Hierarchy<ScopeElement, string>[]>(value)

  useEffect(() => {
    context?.updateFormData(name, population)
  }, [population, context, name])

  return (
    <ExecutiveUnitsInput
      value={value}
      sourceType={sourceType}
      disabled={disabled}
      onChange={(selectedPopulation) => setPopulation(selectedPopulation)}
    />
  )
}

export default ExecutiveUnitsFilter
