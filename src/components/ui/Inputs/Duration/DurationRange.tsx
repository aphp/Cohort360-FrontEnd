import React, { useEffect, useState } from 'react'

import { checkMinMaxValue, convertDurationToString, convertStringToDuration } from 'utils/age'
import { DurationRangeType } from 'types/searchCriterias'
import { DurationType } from 'types/dates'
import { ErrorType } from 'types/error'
import { BlockWrapper } from 'components/ui/Layout/styles'
import DurationInput from './DurationInput'
import { ErrorMessage } from '../Errors/styles'
import { DurationLabel } from './styles'

type DurationRangeProps = {
  value: DurationRangeType
  label: string
  deidentified?: boolean
  disabled?: boolean
  onChange: (newDuration: DurationRangeType) => void
  onError: (isError: boolean) => void
}
const defaultMinDuration: DurationType = {
  year: 0,
  month: null,
  day: null
}
const defaultMaxDuration: DurationType = {
  year: 130,
  month: null,
  day: null
}
const DurationRange: React.FC<DurationRangeProps> = ({
  value,
  label,
  deidentified = false,
  disabled = false,
  onChange,
  onError
}) => {
  const [minDuration, setMinDuration] = useState<DurationType>(convertStringToDuration(value[0]) || defaultMinDuration)
  const [maxDuration, setMaxDuration] = useState<DurationType>(convertStringToDuration(value[1]) || defaultMaxDuration)
  const [error, setError] = useState<ErrorType>({ isError: false, errorMessage: '' })

  useEffect(() => {
    setError({ isError: false, errorMessage: '' })
    onError(false)
    if (!checkMinMaxValue(minDuration, maxDuration)) {
      setError({ isError: true, errorMessage: 'La date maximale doit être supérieure à la date minimale.' })
      onError(true)
    } else if (maxDuration.year === 0 && !maxDuration.month && !maxDuration.day) {
      setError({ isError: true, errorMessage: 'Au moins une des valeurs maximales ne doit pas être égale à 0' })
      onError(true)
    } else {
      onChange([convertDurationToString(minDuration), convertDurationToString(maxDuration)])
    }
  }, [minDuration, maxDuration])

  return (
    <BlockWrapper>
      <DurationLabel variant="h3" disabled={disabled}>
        {label} :
      </DurationLabel>
      <DurationInput
        disabled={disabled}
        value={minDuration}
        deidentified={deidentified}
        label=" Âge minimum"
        onChange={(newDuration) => setMinDuration(newDuration)}
      />
      <DurationInput
        disabled={disabled}
        value={maxDuration}
        deidentified={deidentified}
        label=" Âge maximum"
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
