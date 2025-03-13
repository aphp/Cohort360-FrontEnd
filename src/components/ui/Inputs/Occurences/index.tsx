import React, { ReactNode, useEffect, useState } from 'react'
import { Grid, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material'
import { Comparators } from 'types/requestCriterias'
import { CriteriaLabel } from 'components/ui/CriteriaLabel'

type OccurenceInputProps = {
  value: number
  comparator: Comparators
  maxValue?: number
  defaultValue?: number
  onchange: (value: number | null, comparator: Comparators, upperRangeValue?: number) => void
  enableNegativeValues?: boolean
  floatValues?: boolean
  label?: string
  withInfo?: ReactNode
  withHierarchyInfo?: boolean
  allowBetween?: boolean
  disabled?: boolean
}

const OccurenceInput = ({
  value,
  comparator,
  maxValue,
  defaultValue,
  onchange,
  floatValues = false,
  enableNegativeValues = false,
  label,
  withInfo,
  withHierarchyInfo = false,
  allowBetween = false,
  disabled = false
}: OccurenceInputProps) => {
  const [occurrenceValue, setOccurrenceValue] = useState<string>(value.toString())
  const [upperRangeValue, setUpperRangeValue] = useState<string | undefined>(maxValue?.toString())
  const [comparatorValue, setComparatorValue] = useState(comparator)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    const typedOccurenceValue =
      defaultValue === undefined && occurrenceValue === ''
        ? null
        : parseFloat(occurrenceValue === '' ? `${defaultValue}` : occurrenceValue)
    const typedUpperRangeValue = upperRangeValue
      ? parseFloat(upperRangeValue === '' ? '0' : upperRangeValue)
      : undefined
    if (
      typedUpperRangeValue !== undefined &&
      typedOccurenceValue !== null &&
      typedOccurenceValue > typedUpperRangeValue
    ) {
      setError('INCOHERENT_VALUE_ERROR')
    } else if (comparatorValue === Comparators.BETWEEN && typedUpperRangeValue === undefined) {
      setError('MISSING_VALUE_ERROR')
    } else {
      setError(undefined)
      onchange(typedOccurenceValue, comparatorValue, typedUpperRangeValue)
    }
  }, [comparatorValue, occurrenceValue, upperRangeValue])

  const checkedValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (
      (floatValues && (enableNegativeValues ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/).exec(newValue)) ||
      /^\d+$/.exec(newValue) ||
      (enableNegativeValues && newValue === '0' && comparatorValue === Comparators.LESS)
    ) {
      return newValue
    }
    return ''
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const newValue = checkedValue(e)
    setter(newValue)
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
    const typedOccurenceValue = parseFloat(occurrenceValue)
    if (!enableNegativeValues && newComparator === Comparators.LESS && typedOccurenceValue === 0) {
      setOccurrenceValue('1')
    }
  }

  const getInfoText = () => {
    if (withInfo) {
      return withInfo
    } else if (withHierarchyInfo) {
      return (
        <span>
          Si vous choisissez un chapitre, le nombre d'occurrences ne s'applique pas sur un unique élément de ce
          chapitre, mais sur l'ensemble des éléments de ce chapitre. <br /> Exemple: Nombre d'occurrences &ge; 3 sur un
          chapitre signifie que l'on inclus les patients qui ont eu au moins 3 éléments de ce chapitre, distincts ou
          non.
        </span>
      )
    }
    return null
  }

  return (
    <>
      {label && <CriteriaLabel label={label} infoIcon={getInfoText()} />}
      <Grid
        style={{
          display: 'grid',
          gridTemplateColumns: comparatorValue === Comparators.BETWEEN ? '100px 1fr 1fr' : '100px 1fr',
          alignItems: 'start'
        }}
      >
        <Select
          style={{ marginRight: '1em' }}
          value={comparatorValue ?? Comparators.GREATER_OR_EQUAL}
          onChange={handleComparatorChange}
          disabled={disabled}
        >
          {(Object.keys(Comparators) as (keyof typeof Comparators)[])
            .filter((key) => allowBetween || Comparators[key] !== Comparators.BETWEEN)
            .map((key) => (
              <MenuItem key={key} value={Comparators[key]}>
                {Comparators[key]}
              </MenuItem>
            ))}
        </Select>

        <TextField
          required
          type="text"
          className="number-comparator-value"
          variant="outlined"
          value={occurrenceValue}
          onChange={handleMinValueChange}
          placeholder={comparatorValue === Comparators.BETWEEN ? 'Valeur minimale (0)' : '0'}
          disabled={disabled}
          error={!!error}
        />
        {comparatorValue === Comparators.BETWEEN && (
          <TextField
            required
            type="text"
            className="number-comparator-value"
            variant="outlined"
            value={upperRangeValue}
            onChange={handleMaxValueChange}
            placeholder="Valeur maximale (0)"
            disabled={disabled}
            error={!!error}
          />
        )}
      </Grid>
    </>
  )
}

export default OccurenceInput
