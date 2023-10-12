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
  const { classes } = useStyles()

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
          ) : !providersList || providersList?.length === 0 ? (
            <TableRow>
              <TableCellWrapper colSpan={7}>
                <Typography className={classes.loadingSpinnerContainer}>Aucun résultat à afficher</Typography>
              </TableCellWrapper>
            </TableRow>
          ) : (
            providersList.map((provider: Provider) => {
              return (
                provider && (
                  <TableRow key={provider.provider_id} className={classes.tableBodyRows} hover>
                    <TableCellWrapper>{provider.provider_source_value}</TableCellWrapper>
                    <TableCellWrapper>{provider.lastname?.toLocaleUpperCase()}</TableCellWrapper>
                    <TableCellWrapper>{provider.firstname}</TableCellWrapper>
                    <TableCellWrapper>{provider.email ?? '-'}</TableCellWrapper>
                    <TableCellWrapper>
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

export default ProvidersTable
