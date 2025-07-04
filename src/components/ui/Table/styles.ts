import { TableCell, styled } from '@mui/material'

type CustomProps = {
  first?: boolean
  last?: boolean
  padding?: number
}

export const TableCellWrapper = styled(TableCell)<CustomProps>(({ first, last, padding }) => ({
  padding: first ? '0px 8px 0px 12px' : last ? '0px 12px 0px 8px' : padding ? padding : '0 8px',
  color: '#303030',
  fontSize: 13,
  whiteSpace: 'nowrap',
  lineHeight: '1rem'
}))
