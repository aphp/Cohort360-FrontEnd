import { Collapse, styled } from '@mui/material'

export const CollapseWrapper = styled(Collapse)(() => ({
  maxWidth: '100%',
  '& .MuiCollapse-wrapperInner > *': {
    margin: '0 0 1em'
  }
}))
