import { User } from 'types'
import { Action, CellType, Row, Table } from 'types/table'
import DeleteIcon from '@mui/icons-material/Delete'

const mapUsersToRows = (list: User[]) => {
  const rows: Row[] = []
  list.forEach((user) => {
    const row: Row = [
      {
        id: `${user.username}-username`,
        value: user.username ?? 'N/A',
        type: CellType.TEXT
      },
      {
        id: `${user.username}-lastname`,
        value: user.lastname?.toLocaleUpperCase() ?? 'N/A',
        type: CellType.TEXT
      },
      { id: `${user.username}-firstname`, value: user.firstname ?? 'N/A', type: CellType.TEXT },
      {
        id: `${user.username}-email`,
        value: user.email ?? 'N/A',
        type: CellType.TEXT
      },
      {
        id: `${user.username}-delete`,
        value: [
          {
            title: "Supprimer l'utilisateur",
            icon: DeleteIcon,
            onClick: () => {}
          }
        ] as Action[],
        type: CellType.ACTIONS
      }
    ]
    rows.push(row)
  })

  return rows
}

const mapUsersToColumns = () => {
  const columns = [
    { label: 'Identifiant APH' },
    { label: 'Nom' },
    { label: 'Prénom' },
    { label: 'Email' },
    { label: 'Suppression' }
  ]

  return columns
}

export const mapUsersToTable = (list: User[]): Table => {
  const table: Table = { rows: [], columns: [] }
  table.columns = mapUsersToColumns()
  table.rows = mapUsersToRows(list)
  return table
}
