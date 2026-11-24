import React, { FocusEvent, useRef, useState } from 'react'
import moment, { Moment } from 'moment'

import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { frFR } from '@mui/x-date-pickers/locales'
import { DATE_ERROR_MESSAGES, ISO_DATE_FORMAT, isIncompleteDate, isIncompleteDateText, toIsoDate } from 'utils/dates'

const INPUT_FORMAT = 'DD/MM/Y'

/**
 * Formats the field's `Y` token without leading zeros (moment pads it to 4 digits),
 * so MUI fills the year left to right: 2, 20, 202, 2026 instead of 0002, 0020, 0202
 */
class AdapterMomentUnpaddedYear extends AdapterMoment {
  constructor(...args: ConstructorParameters<typeof AdapterMoment>) {
    super(...args)
    const formatByString = this.formatByString
    this.formatByString = (value, format) => (format === 'Y' ? String(value.year()) : formatByString(value, format))
  }
}

type DateInputProps = {
  defaultValue: string | null
  onChange: (date: string | null) => void
  onIncomplete?: (isIncomplete: boolean) => void
  error?: string
  disabled?: boolean
  clearable?: boolean
  variant?: 'standard' | 'outlined'
  className?: string
}

/**
 * Date field shared by every date filter: emits YYYY-MM-DD strings, shows the format error on blur
 *
 * @param defaultValue - Initial date (YYYY-MM-DD), read on mount only
 * @param onChange - Called with the date, or null when the field is empty or incomplete
 * @param onIncomplete - Called on every change, so the parent can disable its validation button
 * @param error - Error computed by the parent (e.g. end before start), shown when there is no format error
 */
const DateInput = (props: DateInputProps) => {
  const {
    defaultValue,
    onChange,
    onIncomplete,
    error,
    disabled = false,
    clearable = false,
    variant = 'outlined',
    className
  } = props
  // AdapterMoment needs a Moment, a raw string crashes the picker
  const [date, setDate] = useState<Moment | null>(() =>
    defaultValue ? moment(defaultValue, ISO_DATE_FORMAT, true) : null
  )
  const [isIncomplete, setIsIncomplete] = useState(false)
  const [blurred, setBlurred] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const updateIncomplete = (newIsIncomplete: boolean) => {
    setIsIncomplete(newIsIncomplete)
    if (!newIsIncomplete) setBlurred(false)
    onIncomplete?.(newIsIncomplete)
  }

  // MUI doesn't publish a partly typed date (01/10/AAAA stays null): read the text of its hidden input
  const checkText = () => updateIncomplete(isIncompleteDateText(inputRef.current?.value ?? ''))

  const handleChange = (newDate: Moment | null) => {
    const newIsIncomplete = isIncompleteDate(newDate)
    setDate(newDate)
    updateIncomplete(newIsIncomplete)
    onChange(newIsIncomplete ? null : toIsoDate(newDate))
  }

  // Focus moving between the day, month and year sections stays inside the field
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return
    checkText()
    setBlurred(true)
  }

  const helperText = blurred && isIncomplete ? DATE_ERROR_MESSAGES.incomplete : error

  return (
    <LocalizationProvider
      dateAdapter={AdapterMomentUnpaddedYear}
      adapterLocale={'fr'}
      localeText={frFR.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <DesktopDatePicker
        disabled={disabled}
        format={INPUT_FORMAT}
        onChange={handleChange}
        value={date}
        slotProps={{
          textField: {
            variant,
            className,
            fullWidth: true,
            error: !!helperText,
            helperText,
            inputRef,
            onBlur: handleBlur,
            onKeyUp: checkText
          },
          field: { clearable, shouldRespectLeadingZeros: true }
        }}
      />
    </LocalizationProvider>
  )
}

export default DateInput
