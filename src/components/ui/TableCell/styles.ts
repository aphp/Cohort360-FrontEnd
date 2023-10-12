import { TableCell, styled } from '@mui/material'

type CustomProps = {
  align?: string
}

export const TableCellWrapper = styled(TableCell)<CustomProps>(({ align = 'center' }) => ({
  textAlign: align
}))
