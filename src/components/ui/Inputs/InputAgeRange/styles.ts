/*import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  ageFilter: {
    paddingBottom: '9px'
  },
  inputContainer: {
    padding: '1em',
    display: 'flex',
    flex: '1 1 0%',
    flexDirection: 'column'
  },
  inputItem: {
    margin: '1em',
    width: 'calc(100% - 2em)'
  },
    textField: {
    '& input': {
      padding: '2px 4px 3px 0'
    }
  },
    durationLegend: {
    color: '#5B5E63',
    fontWeight: 900,
    fontSize: 12,
    textAlign: 'center'
  },
}))



export default useStyles*/

import { TextField, Typography, styled } from '@mui/material'

type CustomProps = {
  active?: boolean
}

export const TextFieldWrapper = styled(TextField)<CustomProps>(({ active = false }) => ({
  '& input': {
    padding: '2px 4px 3px 0',
    textAlign: 'center',
    fontWeight: active ? 900 : 400,
    color: active ? '#153D8A' : '#5B5E63'
  }
}))

export const DurationLegendWrapper = styled(Typography)(() => ({
  fontWeight: 700,
  fontSize: 12.5,
  textAlign: 'center'
}))

export const AgeUnitWrapper = styled(Typography)<CustomProps>(({ active = false }) => ({
  color: active ? '#153D8A' : '#5B5E63',
  fontWeight: active ? 700 : 400,
  fontSize: 11.5,
  textAlign: 'center'
}))

export const ErrorMessage = styled(Typography)(() => ({
  color: '#f44336',
  marginTop: 4,
  fontSize: 11.5,
  fontWeight: 600
}))
