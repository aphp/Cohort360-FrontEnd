import { InputWrapper } from 'components/ui/Inputs/styles'
import DurationRange from 'components/ui/Inputs/DurationRange'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { DurationRangeType } from 'types/searchCriterias'

type BirthdatesRangesFilterProps = {
  value: DurationRangeType
  name: string
  deidentified?: boolean
  disabled?: boolean
}

const BirthdatesRangesFilter = ({
  name,
  value,
  deidentified = false,
  disabled = false
}: BirthdatesRangesFilterProps) => {
  const context = useContext(FormContext)
  const [birthdatesRanges, setBirthdatesRanges] = useState(value.map((date) => date) as DurationRangeType)

  const onError = (isError: boolean) => {
    if (context?.updateError) context?.updateError(isError)
  }

  useEffect(() => {
    if (context?.updateFormData) context?.updateFormData(name, birthdatesRanges)
  }, [birthdatesRanges[0], birthdatesRanges[1]])

  return (
    <InputWrapper>
      <DurationRange
        includeDays={!deidentified}
        disabled={disabled}
        label="Âge"
        onError={onError}
        value={birthdatesRanges}
        onChange={(newBirthdatesRanges: DurationRangeType) => setBirthdatesRanges(newBirthdatesRanges)}
      />
    </InputWrapper>
  )
}

export default BirthdatesRangesFilter
