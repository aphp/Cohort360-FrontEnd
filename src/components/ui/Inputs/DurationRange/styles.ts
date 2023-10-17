import { TextField, Typography, styled } from '@mui/material'

type CustomProps = {
  active?: boolean
  disabled?: boolean
}
export const DurationLabel = styled(Typography)<CustomProps>(({ disabled = false }) => ({
  color: disabled ? '#000' : '#153D8A',
  opacity: disabled ? 0.5 : 1
}))

export const TextFieldWrapper = styled(TextField)<CustomProps>(({ active = false }) => ({
  '& input': {
    padding: '2px 4px 3px 0',
    textAlign: 'center',
    fontWeight: active ? 900 : 400,
    color: active ? '#153D8A' : '#5B5E63'
  }
}))

export const DurationLegendWrapper = styled(Typography)(() => ({
  fontWeight: 500,
  fontSize: 12.5,
  textAlign: 'center',
  color: '#000',
  opacity: 0.6
}))

export const DurationUnitWrapper = styled(Typography)<CustomProps>(({ active = false }) => ({
  color: active ? '#153D8A' : '#5B5E63',
  fontWeight: active ? 700 : 400,
  fontSize: 11.5,
  textAlign: 'center'
}))
