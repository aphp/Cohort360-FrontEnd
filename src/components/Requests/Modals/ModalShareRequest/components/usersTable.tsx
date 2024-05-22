import React from 'react'

import {
  IconButton,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Tooltip,
  CircularProgress
} from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import DeleteIcon from '@mui/icons-material/Delete'

import useStyles from './styles'
import { User } from 'types'

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
  const { classes } = useStyles()

  const columns = [
    {
      label: 'Identifiant APH',
      code: 'username'
    },
    {
      label: 'Nom',
      code: 'lastname'
    },
    {
      label: 'Prénom',
      code: 'firstname'
    },
    {
      label: 'Email',
      code: 'email'
    },
    {
      label: 'Suppression'
    }
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
    <TableContainer component={Paper}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow className={classes.tableHead}>
            {columns.map((column, index: number) => (
              <TableCellWrapper key={index} className={classes.tableHeadCell}>
                {column.label}
              </TableCellWrapper>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCellWrapper colSpan={7}>
                <div className={classes.loadingSpinnerContainer}>
                  <CircularProgress size={50} />
                </div>
              </TableCellWrapper>
            </TableRow>
          ) : !usersList || usersList?.length === 0 ? (
            <TableRow>
              <TableCellWrapper colSpan={7}>
                <Typography className={classes.loadingSpinnerContainer}>Aucun résultat à afficher</Typography>
              </TableCellWrapper>
            </TableRow>
          ) : (
            usersList.map((user: User) => {
              return (
                user && (
                  <TableRow key={user.username} className={classes.tableBodyRows} hover>
                    <TableCellWrapper>{user.username}</TableCellWrapper>
                    <TableCellWrapper>{user.lastname?.toLocaleUpperCase()}</TableCellWrapper>
                    <TableCellWrapper>{user.firstname}</TableCellWrapper>
                    <TableCellWrapper>{user.email ?? '-'}</TableCellWrapper>
                    <TableCellWrapper>
                      <Tooltip title="Supprimer l'utilisateur" style={{ padding: '0 12px' }}>
                        <IconButton
                          onClick={(event) => {
                            event.stopPropagation()
                            deleteItem(user)
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCellWrapper>
                  </TableRow>
                )
              )
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default UsersTable
