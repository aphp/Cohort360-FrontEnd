import CalendarRange from 'components/ui/Inputs/CalendarRange'
import { BlockWrapper } from 'components/ui/Layout'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { DurationRangeType } from 'types/searchCriterias'

type DatesRangeFilterProps = {
  values: DurationRangeType
  names: string[]
  disabled?: boolean
}

const DatesRangeFilter = ({ names, values, disabled }: DatesRangeFilterProps) => {
  const context = useContext(FormContext)
  const [startDate, setStartDate] = useState(values[0])
  const [endDate, setEndDate] = useState(values[1])

  const onError = (isError: boolean) => {
    context?.updateError(isError)
  }

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(names[0], startDate)
  }, [startDate])

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(names[1], endDate)
  }, [endDate])

  return (
    <BlockWrapper>
      <CalendarRange
        disabled={disabled}
        label="Date"
        value={[startDate, endDate]}
        onChange={(value) => {
          setStartDate(value[0])
          setEndDate(value[1])
        }}
        onError={onError}
      />
    </BlockWrapper>
  )
}

export default DatesRangeFilter
