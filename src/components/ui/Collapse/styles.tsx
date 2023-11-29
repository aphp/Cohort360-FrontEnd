import { Collapse, styled } from '@mui/material'

type CustomProps = {
  margin?: string
}

export const CollapseWrapper = styled(Collapse)<CustomProps>(({ margin }) => ({
  '& div': {
    margin: margin
  }
}))
