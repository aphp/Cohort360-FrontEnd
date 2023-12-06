import { Grid, Typography, styled } from '@mui/material'
import { DesktopDatePicker } from '@mui/x-date-pickers'

type CustomProps = {
  disabled?: boolean
}

export const CalendarLabel = styled(Typography)<CustomProps>(({ disabled = false }) => ({
  color: disabled ? '#000' : '#153D8A',
  opacity: disabled ? 0.5 : 1
}))

export const DateWrapper = styled(Grid)(() => ({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr' /* First column auto-sized, second column takes up remaining space */,
  gap: 10,
  alignItems: 'center'
}))

export const DatePickerWrapper = styled(DesktopDatePicker)(() => ({
  width: '100%'
}))
