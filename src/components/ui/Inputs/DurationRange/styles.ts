import { TextField, Typography, styled } from '@mui/material'

type CustomProps = {
  activated?: boolean
  disabled?: boolean
}
export const DurationLabel = styled(Typography)<CustomProps>(({ disabled = false }) => ({
  color: disabled ? '#000' : '#153D8A',
  opacity: disabled ? 0.5 : 1
}))

export const TextFieldWrapper = styled(TextField)<CustomProps>(({ activated = false }) => ({
  '& input': {
    padding: '2px 4px 3px 0',
    textAlign: 'center',
    fontWeight: activated ? 900 : 400,
    color: activated ? '#153D8A' : '#5B5E63'
  }
}))

export const DurationLegendWrapper = styled(Typography)(() => ({
  fontWeight: 500,
  fontSize: 12.5,
  textAlign: 'center',
  color: '#000',
  opacity: 0.6
}))

export const DurationUnitWrapper = styled(Typography)<CustomProps>(({ activated = false }) => ({
  color: activated ? '#153D8A' : '#5B5E63',
  fontWeight: activated ? 700 : 400,
  fontSize: 11.5,
  textAlign: 'center'
}))
