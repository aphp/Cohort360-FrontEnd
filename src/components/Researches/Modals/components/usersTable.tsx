import React from 'react'

import DataTable from 'components/ui/Table'

import { User } from 'types'
import { mapUsersToTable } from 'mappers/users'
import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'

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
  const deleteItem = (user: User) => {
    const _usersAssociatedCopy = usersAssociated ?? []

    const index = _usersAssociatedCopy.indexOf(user) ?? -1
    if (index > -1) {
      _usersAssociatedCopy.splice(index, 1)
    }

    onChangeUsersAssociated('usersAssociated', _usersAssociatedCopy)
  }

  const table = mapUsersToTable(usersList, deleteItem)

  return loading ? <CenteredCircularProgress /> : <DataTable value={table} noMarginBottom />
}

export default UsersTable
