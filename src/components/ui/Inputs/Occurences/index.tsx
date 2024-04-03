import React, { useEffect, useState } from 'react'
import { MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material'
import { Comparators } from 'types/requestCriterias'
import { OccurenceInputWrapper } from './styles'

type OccurenceInputProps = {
  value: number
  comparator: Comparators
  onchange: (value: number, comparator: Comparators) => void
  enableNegativeValues?: boolean
}

const OccurenceInput = ({ value, comparator, onchange, enableNegativeValues = false }: OccurenceInputProps) => {
  const [occurrenceValue, setOccurrenceValue] = useState(value)
  const [comparatorValue, setComparatorValue] = useState(comparator)

  useEffect(() => {
    if (!enableNegativeValues && comparatorValue === Comparators.LESS && occurrenceValue === 0) {
      setOccurrenceValue(1)
      onchange(1, comparatorValue)
    }
  }, [comparatorValue, occurrenceValue, enableNegativeValues, onchange])

  const handleOccurrenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? '0' : e.target.value
    if (newValue.match(/^\d+$/) || (enableNegativeValues && newValue === '0' && comparatorValue === Comparators.LESS)) {
      const numericValue = parseInt(newValue, 10)
      setOccurrenceValue(numericValue)
      onchange(numericValue, comparatorValue)
    }
  }

  const handleComparatorChange = (event: SelectChangeEvent<Comparators>) => {
    const newComparator = event.target.value as Comparators
    setComparatorValue(newComparator)
    if (!enableNegativeValues && newComparator === Comparators.LESS && occurrenceValue === 0) {
      setOccurrenceValue(1)
      onchange(1, newComparator)
    } else {
      onchange(occurrenceValue, newComparator)
    }
  }

  return (
    <OccurenceInputWrapper>
      <Select
        style={{ marginRight: '1em' }}
        id="criteria-occurrenceComparator-select"
        value={comparatorValue}
        onChange={handleComparatorChange}
      >
        <MenuItem value={Comparators.LESS_OR_EQUAL}>{Comparators.LESS_OR_EQUAL}</MenuItem>
        <MenuItem value={Comparators.LESS}>{Comparators.LESS}</MenuItem>
        <MenuItem value={Comparators.EQUAL}>{Comparators.EQUAL}</MenuItem>
        <MenuItem value={Comparators.GREATER}>{Comparators.GREATER}</MenuItem>
        <MenuItem value={Comparators.GREATER_OR_EQUAL}>{Comparators.GREATER_OR_EQUAL}</MenuItem>
      </Select>

      <TextField
        required
        type="text"
        id="criteria-occurrence-required"
        value={occurrenceValue}
        onChange={handleOccurrenceChange}
      />
    </OccurenceInputWrapper>
  )
}

export default OccurenceInput
