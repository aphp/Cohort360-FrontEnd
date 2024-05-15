import React, { useEffect, useState } from 'react'
import { MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material'
import { Comparators } from 'types/requestCriterias'
import { OccurenceInputWrapper } from '../Occurences/styles'

type NumericConditionInputProps = {
  value: number
  comparator: Comparators
  onchange: (value: number, comparator: Comparators) => void
  enableNegativeValues?: boolean
}

const NumericConditionInput = ({
  value,
  comparator,
  onchange,
  enableNegativeValues = false
}: NumericConditionInputProps) => {
  const [occurrenceValue, setOccurrenceValue] = useState<number | string>(value)
  const [comparatorValue, setComparatorValue] = useState(comparator)

  useEffect(() => {
    if (
      !enableNegativeValues &&
      comparatorValue === Comparators.LESS &&
      (occurrenceValue === 0 || occurrenceValue === '0')
    ) {
      setOccurrenceValue(1)
      onchange(1, comparatorValue)
    }
  }, [comparatorValue, occurrenceValue, enableNegativeValues, onchange])

  const handleOccurrenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value

    if (newValue === '' || newValue.match(enableNegativeValues ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/)) {
      setOccurrenceValue(newValue)
      if (newValue !== '' && newValue !== '-' && newValue !== '.') {
        onchange(parseFloat(newValue), comparatorValue)
      } else {
        setOccurrenceValue(newValue)
      }
    }
  }
  const handleComparatorChange = (event: SelectChangeEvent<Comparators>) => {
    const newComparator = event.target.value as Comparators
    setComparatorValue(newComparator)
    if (
      !enableNegativeValues &&
      newComparator === Comparators.LESS &&
      (occurrenceValue === 0 || occurrenceValue === '0')
    ) {
      setOccurrenceValue(1)
      onchange(1, newComparator)
    } else {
      onchange(typeof occurrenceValue === 'string' ? parseFloat(occurrenceValue) : occurrenceValue, newComparator)
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

export default NumericConditionInput
