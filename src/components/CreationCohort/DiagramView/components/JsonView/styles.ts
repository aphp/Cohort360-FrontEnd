import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

export const Container = styled(Box)({
  width: '100%'
})

export const EditorWrapper = styled(Box)<{ hasError: boolean }>(({ hasError }) => ({
  border: '2px solid',
  borderColor: hasError ? '#d33' : '#ccc',
  borderRadius: 10,
  overflow: 'hidden',
  marginTop: '2rem'
}))

export const Message = styled(Box)({
  fontSize: 13
})

export const ErrorMessage = styled(Message)({
  color: '#d33'
})

export const SuccessMessage = styled(Message)({
  color: '#2a7',
  fontWeight: 'bold'
})

export const MessageTitle = styled(Box)({
  fontWeight: 'bold',
  marginBottom: 4
})

export const ErrorList = styled('ul')({
  margin: 0,
  paddingLeft: 18
})
