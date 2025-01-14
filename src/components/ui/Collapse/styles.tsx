import { Collapse, styled } from '@mui/material'

export const CollapseWrapper = styled(Collapse)(() => ({
  '& .MuiCollapse-wrapperInner > *': {
    margin: '0 0 1em'
  }
}))
