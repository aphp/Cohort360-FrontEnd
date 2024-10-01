import { TableCellWrapper } from 'components/ui/TableCell/styles'
import React from 'react'

type TextCellProps = { value: string }

const TextCell = ({ value }: TextCellProps) => {
  return <TableCellWrapper>{value}</TableCellWrapper>
}

export default TextCell
