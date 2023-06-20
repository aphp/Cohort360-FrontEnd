import { DialogContent, styled } from '@mui/material'

type CustomProps = {
  width: string
}

export const DialogContentWrapper = styled(DialogContent)<CustomProps>(({ width }) => ({
  width: width
}))
