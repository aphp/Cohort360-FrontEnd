import { Typography } from '@mui/material'
import CalendarRange from 'components/ui/Inputs/CalendarRange'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { DurationRangeType } from 'types/searchCriterias'

type DatesRangeFilterProps = {
  label?: string
  value: DurationRangeType
  names: string[]
  disabled?: boolean
}

const DatesRangeFilter = ({ names, value, label, disabled }: DatesRangeFilterProps) => {
  const context = useContext(FormContext)
  const [startDate, setStartDate] = useState(value[0])
  const [endDate, setEndDate] = useState(value[1])

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
    <InputWrapper>
      <Typography variant="h3">{label}</Typography>
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
    </InputWrapper>
  )
}

export default DatesRangeFilter
