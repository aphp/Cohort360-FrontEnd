import React, { Fragment, useEffect, useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  CircularProgress,
  TextField,
  Autocomplete
} from '@mui/material'

import { User } from 'types'

import { useDebounce } from 'utils/debounce'
import { getUsers } from 'services/aphp/serviceUsers'
import { Direction, Order, OrderBy } from 'types/searchCriterias'
import { useAppDispatch } from 'state'
import { impersonate } from 'state/me'

const orderDefault: OrderBy = { orderBy: Order.LASTNAME, orderDirection: Direction.ASC }

const ModalImpersonation: React.FC<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
  const dispatch = useAppDispatch()
  const [impersonatedUser, setImpersonatedUser] = useState<User>()
  const [usersSearchResults, setUsersSearchResults] = useState<User[]>([])
  const [loadingOnSearch, setLoadingOnSearch] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearchTerm = useDebounce(700, searchInput)

  const impersonateUserEmail = impersonatedUser?.email ? `- ${impersonatedUser.email}` : ''

  const handleConfirm = () => {
    dispatch(impersonate(impersonatedUser))
    handleClose()
  }

  const handleClose = () => {
    setSearchInput('')
    setImpersonatedUser(undefined)
    if (onClose && typeof onClose === 'function') {
      onClose()
    }
  }

  useEffect(() => {
    const _searchUsers = async () => {
      try {
        setLoadingOnSearch(true)

        const usersResp = await getUsers(orderDefault, 1, debouncedSearchTerm)

        setUsersSearchResults(usersResp.users)

        setLoadingOnSearch(false)
      } catch (error) {
        console.error('Erreur lors de la recherche des utilisateurs')
        setUsersSearchResults([])
        setLoadingOnSearch(false)
      }
    }

    if (debouncedSearchTerm && debouncedSearchTerm?.length > 0) {
      _searchUsers()
    } else {
      setUsersSearchResults([])
    }
  }, [debouncedSearchTerm])

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" aria-labelledby="form-dialog-title">
      <DialogTitle>Impersonnifier un utilisateur</DialogTitle>
      <DialogContent>
        <Grid container direction="column">
          <div style={{ display: 'flex', flexDirection: 'column', margin: '1em 0 0 0' }}>
            <Autocomplete
              noOptionsText="Rechercher un utilisateur"
              clearOnEscape
              options={usersSearchResults ?? []}
              loading={loadingOnSearch}
              onChange={(e, value) => {
                setImpersonatedUser(value || undefined)
              }}
              filterOptions={(options, { inputValue }) => options}
              onInputChange={(event, value) => setSearchInput(value)}
              getOptionLabel={(option) =>
                `${option.username} - ${option.lastname?.toLocaleUpperCase()} ${option.firstname} ${
                  option.email ? `- ${option.email}` : ''
                }`
              }
              renderInput={(params) => {
                const value = impersonatedUser
                  ? `${impersonatedUser.username} - ${impersonatedUser.lastname?.toLocaleUpperCase()} ${
                      impersonatedUser.firstname
                    } ${impersonateUserEmail}`
                  : searchInput
                delete params.inputProps.value
                return (
                  <TextField
                    {...params}
                    label="Rechercher un utilisateur"
                    value={value}
                    onChange={(e) => setSearchInput(e.target.value)}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <Fragment>
                          {loadingOnSearch ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </Fragment>
                      )
                    }}
                    style={{ marginBottom: '1em' }}
                  />
                )
              }}
            />
          </div>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button onClick={handleConfirm} disabled={!impersonatedUser}>
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalImpersonation
