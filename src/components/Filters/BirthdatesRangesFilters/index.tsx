import { InputWrapper } from 'components/ui/Inputs'
import DurationRange from 'components/ui/Inputs/DurationRange'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { DurationRangeType } from 'types/searchCriterias'

type BirthdatesRangesFilterProps = {
  value: DurationRangeType
  name: string
  deidentified?: boolean
}

const BirthdatesRangesFilter = ({ name, value, deidentified = false }: BirthdatesRangesFilterProps) => {
  const context = useContext(FormContext)
  const [birthdatesRanges, setBirthdatesRanges] = useState(value)

  const onError = (isError: boolean) => {
    if (context?.updateError) context?.updateError(isError)
  }

  useEffect(() => {
    if (context?.updateFormData) context?.updateFormData(name, birthdatesRanges)
  }, [birthdatesRanges[0], birthdatesRanges[1]])

  return (
    <InputWrapper>
      <DurationRange
        deidentified={deidentified}
        label="Âge"
        onError={onError}
        value={birthdatesRanges}
        onChange={(newBirthdatesRanges: DurationRangeType) => setBirthdatesRanges(newBirthdatesRanges)}
      />
    </InputWrapper>
  )
}

export default BirthdatesRangesFilter
