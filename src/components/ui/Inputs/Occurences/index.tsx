import React, { useEffect, useState } from 'react'
import { Grid, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material'
import { Comparators } from 'types/requestCriterias'
import { CriteriaLabel } from 'components/ui/CriteriaLabel'

type OccurenceInputProps = {
  value: number
  comparator: Comparators
  maxValue?: number
  onchange: (value: number, comparator: Comparators, upperRangeValue?: number) => void
  enableNegativeValues?: boolean
  floatValues?: boolean
  label?: string
  withHierarchyInfo?: boolean
  allowBetween?: boolean
  disabled?: boolean
}

const OccurenceInput = ({
  value,
  comparator,
  maxValue,
  onchange,
  floatValues = false,
  enableNegativeValues = false,
  label,
  withHierarchyInfo = false,
  allowBetween = false,
  disabled = false
}: OccurenceInputProps) => {
  const [occurrenceValue, setOccurrenceValue] = useState<number>(value)
  const [upperRangeValue, setUpperRangeValue] = useState<number | undefined>(maxValue)
  const [comparatorValue, setComparatorValue] = useState(comparator)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (upperRangeValue !== undefined && occurrenceValue > upperRangeValue) {
      setError('INCOHERENT_VALUE_ERROR')
    } else if (comparatorValue === Comparators.BETWEEN && upperRangeValue === undefined) {
      setError('MISSING_VALUE_ERROR')
    } else {
      setError(undefined)
      onchange(occurrenceValue, comparatorValue, upperRangeValue)
    }
  }, [comparatorValue, occurrenceValue, upperRangeValue])

  const checkedValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? '0' : e.target.value
    if (floatValues && newValue.match(enableNegativeValues ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/)) {
      return parseFloat(newValue)
    } else if (
      newValue.match(/^\d+$/) ||
      (enableNegativeValues && newValue === '0' && comparatorValue === Comparators.LESS)
    ) {
      return parseInt(newValue, 10)
    }
    return undefined
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: number) => void) => {
    const newValue = checkedValue(e)
    if (newValue !== undefined) {
      setter(newValue)
    }
  }

  const handleMinValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleValueChange(e, setOccurrenceValue)
  }

  const handleMaxValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleValueChange(e, setUpperRangeValue)
  }

  const handleComparatorChange = (event: SelectChangeEvent<Comparators>) => {
    const newComparator = event.target.value as Comparators
    setComparatorValue(newComparator)
    if (!enableNegativeValues && newComparator === Comparators.LESS && occurrenceValue === 0) {
      setOccurrenceValue(1)
    }
  }

  return (
    <>
      {label && (
        <CriteriaLabel
          label={label}
          infoIcon={
            withHierarchyInfo && (
              <span>
                Si vous choisissez un chapitre, le nombre d'occurrences ne s'applique pas sur un unique élément de ce
                chapitre, mais sur l'ensemble des éléments de ce chapitre. <br /> Exemple: Nombre d'occurrences &ge; 3
                sur un chapitre signifie que l'on inclus les patients qui ont eu au moins 3 éléments de ce chapitre,
                distincts ou non.
              </span>
            )
          }
        />
      )}
      <Grid
        style={{
          display: 'grid',
          gridTemplateColumns: comparatorValue === Comparators.BETWEEN ? '50px 1fr 1fr' : '100px 1fr',
          alignItems: 'start'
        }}
      >
        <Select
          style={{ marginRight: '1em' }}
          id="biology-value-comparator-select"
          value={comparatorValue ?? Comparators.GREATER_OR_EQUAL}
          onChange={handleComparatorChange}
          disabled={disabled}
        >
          {(Object.keys(Comparators) as (keyof typeof Comparators)[])
            .filter((key) => allowBetween || Comparators[key] !== Comparators.BETWEEN)
            .map((key, index) => (
              <MenuItem key={index} value={Comparators[key]}>
                {Comparators[key]}
              </MenuItem>
            ))}
        </Select>

        <TextField
          required
          type="text"
          id="criteria-value"
          variant="outlined"
          value={occurrenceValue}
          onChange={handleMinValueChange}
          placeholder={comparatorValue === Comparators.BETWEEN ? 'Valeur minimale' : '0'}
          disabled={disabled}
          error={!!error}
        />
        {comparatorValue === Comparators.BETWEEN && (
          <TextField
            required
            type="text"
            id="criteria-value"
            variant="outlined"
            value={upperRangeValue}
            onChange={handleMaxValueChange}
            placeholder="Valeur maximale"
            disabled={disabled}
            error={!!error}
          />
        )}
      </Grid>
    </>
  )
}

export default OccurenceInput
