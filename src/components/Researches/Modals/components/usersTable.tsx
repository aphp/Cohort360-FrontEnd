import React from 'react'

import { TableRow, Typography } from '@mui/material'
import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'
//import DataTable from 'components/DataTable/DataTable'
import IconButtonWithTooltip from 'components/ui/IconButtonWithTooltip'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import DeleteIcon from '@mui/icons-material/Delete'

import { User } from 'types'
import Table from 'components/ui/Table'

type UsersTableProps = {
  usersList: User[]
  loading?: boolean
  usersAssociated?: User[]
  onChangeUsersAssociated: (
    key: 'name' | 'requestName' | 'usersToShare' | 'usersAssociated',
    value: User[] | string
  ) => void
}

const UsersTable: React.FC<UsersTableProps> = ({ usersList, loading, usersAssociated, onChangeUsersAssociated }) => {
  const columns = [
    { label: 'Identifiant APH' },
    { label: 'Nom' },
    { label: 'Prénom' },
    { label: 'Email' },
    { label: 'Suppression' }
  ]

  const deleteItem = (user: User) => {
    const _usersAssociatedCopy = usersAssociated ?? []

    const index = _usersAssociatedCopy.indexOf(user) ?? -1
    if (index > -1) {
      _usersAssociatedCopy.splice(index, 1)
    }

    onChangeUsersAssociated('usersAssociated', _usersAssociatedCopy)
  }

  return (
    <Table columns={columns} noPagination>
      {loading ? (
        <TableRow>
          <TableCellWrapper colSpan={7}>
            <CenteredCircularProgress />
          </TableCellWrapper>
        </TableRow>
      ) : !usersList || usersList?.length === 0 ? (
        <TableRow>
          <TableCellWrapper colSpan={7}>
            <Typography align="center">Aucun résultat à afficher</Typography>
          </TableCellWrapper>
        </TableRow>
      ) : (
        usersList.map((user: User) => {
          return (
            user && (
              <TableRow key={user.username} hover>
                <TableCellWrapper>{user.username}</TableCellWrapper>
                <TableCellWrapper>{user.lastname?.toLocaleUpperCase()}</TableCellWrapper>
                <TableCellWrapper>{user.firstname}</TableCellWrapper>
                <TableCellWrapper>{user.email ?? '-'}</TableCellWrapper>
                <TableCellWrapper>
                  <IconButtonWithTooltip
                    title="Supprimer l'utilisateur"
                    icon={<DeleteIcon />}
                    color="#5bc5f2"
                    onClick={() => deleteItem(user)}
                  />
                </TableCellWrapper>
              </TableRow>
            )
          )
        })
      )}
    </Table>
  )
}

export default UsersTable
