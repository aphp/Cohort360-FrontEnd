import { TableCell, styled } from '@mui/material'

type CustomProps = {
  first?: boolean
  last?: boolean
  padding?: number
}

export const TableCellWrapper = styled(TableCell)<CustomProps>(({ first, last, padding }) => ({
  padding: first ? '5px 5px 5px 20px' : last ? '5px 20px 5px 5px' : padding ? padding : '5px',
  color: '#303030'
}))
