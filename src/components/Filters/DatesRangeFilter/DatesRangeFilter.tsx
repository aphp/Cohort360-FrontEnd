import { FormLabel, IconButton, TextField, Typography } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { DateWrapper, InputWrapper } from 'components/ui/Inputs/styles'
import { FormContext } from 'components/ui/Modal/Modal'
import moment from 'moment'
import ClearIcon from '@mui/icons-material/Clear'
import React, { useContext, useEffect, useState } from 'react'
import { DateRange } from 'types/searchCriterias'

type DatesRangeFilterProps = {
  values: DateRange
  names: string[]
}

const DatesRangeFilter = ({ names, values }: DatesRangeFilterProps) => {
  const context = useContext(FormContext)
  const [startDate, setStartDate] = useState(values[0])
  const [endDate, setEndDate] = useState(values[1])

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(names[0], startDate)
  }, [startDate])

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(names[1], endDate)
  }, [endDate])

  return (
    <>
      <Typography variant="h3">Date :</Typography>
      <InputWrapper>
        <DateWrapper>
          <FormLabel component="legend">Après le :</FormLabel>
          <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'fr'}>
            <DatePicker
              onChange={(date) => setStartDate(moment(date).isValid() ? moment(date).format('YYYY-MM-DD') : null)}
              value={startDate}
              renderInput={(params: any) => <TextField {...params} variant="standard" />}
            />
          </LocalizationProvider>
          {startDate !== null && (
            <IconButton size="small" color="primary" onClick={() => setStartDate(null)}>
              <ClearIcon />
            </IconButton>
          )}
        </DateWrapper>
      </InputWrapper>

      <InputWrapper>
        <DateWrapper>
          <FormLabel component="legend">Avant le :</FormLabel>
          <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'fr'}>
            <DatePicker
              onChange={(date) => setEndDate(moment(date).isValid() ? moment(date).format('YYYY-MM-DD') : null)}
              value={endDate}
              renderInput={(params: any) => <TextField {...params} variant="standard" />}
            />
          </LocalizationProvider>
          {endDate !== null && (
            <IconButton color="primary" onClick={() => setEndDate(null)}>
              <ClearIcon />
            </IconButton>
          )}
        </DateWrapper>
      </InputWrapper>
    </>
  )
}

export default DatesRangeFilter
