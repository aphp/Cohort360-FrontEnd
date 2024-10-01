import { Grid } from '@mui/material'
import { styled } from '@mui/material/styles'

type CustomProps = {
  wrapped?: boolean
  width?: string
  radius?: number
  error?: boolean
}

export const SelectWrapper = styled('div')<CustomProps>(({ width }) => ({
  width: width,
  '.MuiFormControl-root': {
    width: '100%',
    height: 30
  }
}))

export const SelectInputWrapper = styled('div')<CustomProps>(({ radius = 25 }) => ({
  width: '100%',
  height: 'inherit',
  '.MuiInputBase-root': {
    width: 'inherit',
    height: 'inherit',
    borderRadius: radius,
    backgroundColor: '#FFF'
  }
}))

export const SearchInputWrapper = styled('div')<CustomProps>(({ width, error, radius = 25 }) => ({
  flex: 1,
  width: width,
  height: 30,
  backgroundColor: '#FFF',
  border: error ? '1px solid #F44336' : '1px solid #D0D7D8',
  boxShadow: '0px 1px 16px #0000000A',
  borderRadius: radius,
  '.MuiInputBase-root': {
    marginLeft: 10,
    width: '100%'
  }
}))

export const ErrorWrapper = styled('div')(() => ({
  color: '#f44336',
  width: '100%',
  padding: '0 16px'
}))

export const SearchbarWithCheckWrapper = styled(Grid)(() => ({
  margin: '0px !important',
  '& > div': {
    borderRadius: 5,
    minHeight: 50,
    padding: '10px 0px'
  }
}))
