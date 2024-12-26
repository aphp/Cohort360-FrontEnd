import { TableCell, tableCellClasses, styled } from '@mui/material'

type CustomProps = {
  align?: string
  headCell?: boolean
}

export const TableCellWrapper = styled(TableCell)<CustomProps>(({ align = 'center', headCell = false }) => ({
  textAlign: align,
  [`&.${tableCellClasses.head}`]: {
    // TODO: ajouter pour head et body des variants pour exploration et les autres (quoi que Alizé a fait son composant générique??)
    backgroundColor: '#153d8a',
    color: '#FFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: 11,
    padding: 12
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: 12,
    // TODO: ajouter une props pour dire que si c'est la headcell, text en bleu
    color: headCell ? '#153d8a' : '#000',
    fontWeight: headCell ? 700 : 400
  }
}))
