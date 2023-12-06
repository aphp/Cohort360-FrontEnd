import React, { useEffect, useState } from 'react'

import { MenuItem, Select, TextField } from '@mui/material'
import { Comparators } from 'types/requestCriterias'
import { OccurenceInputWrapper } from './styles'

type OccurenceInputProps = {
  value: number
  comparator: Comparators
  onchange: (value: number, comparator: Comparators) => void
}

const OccurenceInput = ({ value, comparator, onchange }: OccurenceInputProps) => {
  const [occurenceValue, setOccurrenceValue] = useState(value)
  const [comparatorValue, setComparatorValue] = useState(comparator)

  useEffect(() => {
    let newValue = occurenceValue
    if (
      (comparatorValue === Comparators.LESS || comparatorValue === Comparators.LESS_OR_EQUAL) &&
      occurenceValue === 0
    ) {
      newValue = 1
      setOccurrenceValue(newValue)
    }
    onchange(newValue, comparatorValue)
  }, [occurenceValue, comparatorValue])

  return (
    <OccurenceInputWrapper>
      <Select
        style={{ marginRight: '1em' }}
        id="criteria-occurrenceComparator-select"
        value={comparator}
        onChange={(event) => setComparatorValue(event.target.value as Comparators)}
      >
        <MenuItem value={Comparators.LESS_OR_EQUAL}>{Comparators.LESS_OR_EQUAL}</MenuItem>
        <MenuItem value={Comparators.LESS}>{Comparators.LESS}</MenuItem>
        <MenuItem value={Comparators.EQUAL}>{Comparators.EQUAL}</MenuItem>
        <MenuItem value={Comparators.GREATER}>{Comparators.GREATER}</MenuItem>
        <MenuItem value={Comparators.GREATER_OR_EQUAL}>{Comparators.GREATER_OR_EQUAL}</MenuItem>
      </Select>

      <TextField
        required
        InputProps={{
          inputProps: {
            min: 0
          }
        }}
        type="number"
        id="criteria-occurrence-required"
        value={value}
        onChange={(e) => setOccurrenceValue(+e.target.value as number)}
      />
    </OccurenceInputWrapper>
  )
}

export default OccurenceInput
