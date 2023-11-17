import { styled } from '@mui/material/styles'

type CustomProps = {
  wrap?: boolean
  width?: string
  error?: boolean
}

export const SearchbarWrapper = styled('div')<CustomProps>(({ wrap }) => ({
  display: 'flex',
  flexWrap: wrap ? 'wrap' : 'wrap-reverse',
  justifyContent: 'space-between',
  alignItems: 'end'
}))

export const SelectWrapper = styled('div')<CustomProps>(({ width }) => ({
  width: width,
  '.MuiFormControl-root': {
    width: '100%',
    height: 30
  }
}))

export const SelectInputWrapper = styled('div')(() => ({
  width: '100%',
  height: 'inherit',
  '.MuiInputBase-root': {
    width: 'inherit',
    height: 'inherit',
    borderRadius: 25,
    backgroundColor: '#FFF'
  }
}))

export const SearchInputWrapper = styled('div')<CustomProps>(({ width, error }) => ({
  flex: 1,
  width: width,
  height: 30,
  backgroundColor: '#FFF',
  border: error ? '1px solid #F44336' : '1px solid #D0D7D8',
  boxShadow: '0px 1px 16px #0000000A',
  borderRadius: 25,
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
