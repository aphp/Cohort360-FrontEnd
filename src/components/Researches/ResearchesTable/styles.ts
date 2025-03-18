import { TableCell, tableCellClasses, styled, buttonBaseClasses, tableSortLabelClasses } from '@mui/material'

type CustomProps = {
  align?: string
  accentcell?: boolean
}

export const TableCellWrapper = styled(TableCell)<CustomProps>(({ align = 'center', accentcell = false }) => ({
  textAlign: align,
  lineHeight: '1rem',
  [`&.${tableCellClasses.head}`]: {
    borderBottom: 0,
    backgroundColor: '#e6f1fd',
    color: '#153d8a',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: 11,
    padding: '12px 16px',
    maxWidth: 160,
    [`& .${buttonBaseClasses.root}`]: {
      color: '#153d8a'
    },
    [`& .${tableSortLabelClasses.icon}`]: {
      fill: '#153d8a'
    }
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13,
    padding: '4px 12px',
    color: '#2b2b2b',
    fontWeight: accentcell ? 700 : 400,
    borderBottom: '1px solid rgba(0,0,0,0.25)'
  }
}))
