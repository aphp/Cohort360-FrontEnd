import { TableCell, tableCellClasses, styled, buttonBaseClasses, tableSortLabelClasses } from '@mui/material'

type CustomProps = {
  align?: string
  accentCell?: boolean
}

export const TableCellWrapper = styled(TableCell)<CustomProps>(({ align = 'center', accentCell = false }) => ({
  textAlign: align,
  lineHeight: '1rem',
  [`&.${tableCellClasses.head}`]: {
    borderBottom: 0,
    backgroundColor: '#e6f1fd',
    // backgroundColor: '#153d8a',
    color: '#153d8a',
    // color: '#FFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: 11,
    padding: '12px 16px',
    maxWidth: 160,
    [`& .${buttonBaseClasses.root}`]: {
      color: '#153d8a'
      // color: '#FFF'
    },
    [`& .${tableSortLabelClasses.icon}`]: {
      fill: '#153d8a'
      // fill: '#FFF'
    }
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13,
    // fontSize: accentCell ? 14 : 13,
    padding: '4px 12px',
    color: '#2b2b2b',
    // color: accentCell ? '#153d8a' : '#000',
    fontWeight: accentCell ? 700 : 400,
    borderBottom: '1px solid rgba(0,0,0,0.25)'
  }
}))
