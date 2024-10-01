import { styled } from '@mui/material'

export const FormWrapper = styled('div')(() => ({
  padding: 0,
  '& > div': {
    marginBottom: 20
  }
}))

export const InputWrapper = styled('div')(() => ({
  width: '100%',
  padding: 0,
  '& > div': {
    margin: '15px 0px'
  }
}))

export const DateWrapper = styled('div')(() => ({
  paddingLeft: 15,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  legend: {
    width: '20%'
  },
  '.MuiFormControl-root': {
    width: '70%'
  }
}))
