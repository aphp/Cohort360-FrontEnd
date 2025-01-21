import { TableCell, tableCellClasses, styled } from '@mui/material'

type CustomProps = {
  align?: string
  headCell?: boolean
}

export const TableCellWrapper = styled(TableCell)<CustomProps>(({ align = 'center', headCell = false }) => ({
  textAlign: align,
  [`&.${tableCellClasses.head}`]: {
    borderBottom: 0,
    // TODO: ajouter pour head et body des variants pour exploration et les autres (quoi que Alizé a fait son composant générique??)
    backgroundColor: '#153d8a',
    color: '#FFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: 11,
    padding: '12px 16px',
    maxWidth: 160
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: '4px 16px',
    color: headCell ? '#153d8a' : '#000',
    fontWeight: headCell ? 700 : 400,
    borderBottom: '1px solid rgba(0,0,0,0.25)'
  }
}))
