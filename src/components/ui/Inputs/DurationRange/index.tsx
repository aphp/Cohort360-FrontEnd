import React, { useEffect, useState } from 'react'

import { checkMinMaxValue, convertDurationToString, convertStringToDuration } from 'utils/age'
import { DurationRangeType } from 'types/searchCriterias'
import { DurationType } from 'types/dates'
import { ErrorType } from 'types/error'
import { BlockWrapper } from 'components/ui/Layout'
import DurationInput from './DurationInput'
import { ErrorMessage } from '../Errors'
import { DurationLabel } from './styles'

type DurationRangeProps = {
  value: DurationRangeType
  label?: string
  includeDays?: boolean
  disabled?: boolean
  unit?: string
  onChange?: (newDuration: DurationRangeType) => void
  onError: (isError: boolean) => void
}
const defaultMinDuration: DurationType = {
  year: null,
  month: null,
  day: null
}
const defaultMaxDuration: DurationType = {
  year: null,
  month: null,
  day: null
}
const DurationRange = ({
  value,
  label,
  includeDays = true,
  disabled = false,
  unit = 'Âge',
  onChange,
  onError
}: DurationRangeProps) => {
  const [minDuration, setMinDuration] = useState<DurationType>(convertStringToDuration(value[0]) || defaultMinDuration)
  const [maxDuration, setMaxDuration] = useState<DurationType>(convertStringToDuration(value[1]) || defaultMaxDuration)
  const [error, setError] = useState<ErrorType>({ isError: false, errorMessage: '' })

  useEffect(() => {
    setError({ isError: false, errorMessage: '' })
    onError(false)
    if (!checkMinMaxValue(minDuration, maxDuration)) {
      setError({ isError: true, errorMessage: 'La date maximale doit être supérieure à la date minimale.' })
      onChange?.([convertDurationToString(minDuration), convertDurationToString(maxDuration)])
      onError(true)
    } else onChange?.([convertDurationToString(minDuration), convertDurationToString(maxDuration)])
  }, [minDuration, maxDuration])

  return (
    <BlockWrapper>
      {label && (
        <BlockWrapper margin="0px 0px 10px 0px">
          <DurationLabel variant="h3">{label}</DurationLabel>
        </BlockWrapper>
      )}
      <BlockWrapper margin="0px 0px 10px 0px">
        <DurationInput
          disabled={disabled}
          value={minDuration}
          includeDays={includeDays}
          label={`${unit} minimum`}
          onChange={(newDuration) => setMinDuration(newDuration)}
        />
      </BlockWrapper>
      <DurationInput
        disabled={disabled}
        value={maxDuration}
        includeDays={includeDays}
        label={`${unit} maximum`}
        onChange={(newDuration) => setMaxDuration(newDuration)}
      />
      {error.isError && (
        <BlockWrapper margin="15px 0px">
          <ErrorMessage>{error.errorMessage}</ErrorMessage>
        </BlockWrapper>
      )}
    </BlockWrapper>
  )
}

export default DurationRange
