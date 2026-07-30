import { TableCell, styled } from '@mui/material'

type CustomProps = {
  first?: boolean
  last?: boolean
  padding?: number
}

const computePadding = (first?: boolean, last?: boolean, padding?: number): string | number => {
  if (first) return '0px 8px 0px 12px'
  if (last) return '0px 12px 0px 8px'
  return padding ?? '0 8px'
}

export const TableCellWrapper = styled(TableCell)<CustomProps>(({ first, last, padding }) => ({
  padding: computePadding(first, last, padding),
  color: '#303030',
  fontSize: 13,
  whiteSpace: 'nowrap',
  lineHeight: '1rem'
}))
