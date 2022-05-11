import React from 'react'

import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Tooltip,
  CircularProgress
} from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'

import useStyles from './styles'
import { Provider } from 'types'

type ProvidersTableProps = {
  providersList: Provider[]
  loading?: boolean
  usersAssociated?: Provider[]
  onChangeUsersAssociated: (key: any, value: any) => void
}

const ProvidersTable: React.FC<ProvidersTableProps> = ({
  providersList,
  loading,
  usersAssociated,
  onChangeUsersAssociated
}) => {
  const classes = useStyles()

  const columns = [
    {
      label: 'Identifiant APH',
      code: 'provider_source_value'
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

  const deleteItem = (provider: Provider) => {
    const _usersAssociatedCopy = usersAssociated ?? []

    const index = _usersAssociatedCopy.indexOf(provider) ?? -1
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
              <TableCell key={index} align="center" className={classes.tableHeadCell}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7}>
                <div className={classes.loadingSpinnerContainer}>
                  <CircularProgress size={50} />
                </div>
              </TableCell>
            </TableRow>
          ) : !providersList || providersList?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography className={classes.loadingSpinnerContainer}>Aucun résultat à afficher</Typography>
              </TableCell>
            </TableRow>
          ) : (
            providersList.map((provider: Provider) => {
              return (
                provider && (
                  <TableRow key={provider.provider_id} className={classes.tableBodyRows} hover>
                    <TableCell align="center">{provider.provider_source_value}</TableCell>
                    <TableCell align="center">{provider.lastname?.toLocaleUpperCase()}</TableCell>
                    <TableCell align="center">{provider.firstname}</TableCell>
                    <TableCell align="center">{provider.email ?? '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Supprimer l'utilisateur" style={{ padding: '0 12px' }}>
                        <IconButton
                          onClick={(event) => {
                            event.stopPropagation()
                            deleteItem(provider)
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
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

export default ProvidersTable
