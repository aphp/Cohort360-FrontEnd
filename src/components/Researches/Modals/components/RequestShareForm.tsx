import React, { useState, useEffect, Fragment, PropsWithChildren } from 'react'

import { Autocomplete, CircularProgress, Grid, TextField, Typography } from '@mui/material'

import { RequestType, User } from 'types'

import { getUsers } from 'services/aphp/serviceUsers'

import UsersTable from './usersTable'
import { useDebounce } from 'utils/debounce'
import { Direction, Order, OrderBy } from 'types/searchCriterias'

const ERROR_TITLE = 'error_title'
const ERROR_USER_SHARE_LIST = 'error_user_share_list'

const orderDefault: OrderBy = { orderBy: Order.LASTNAME, orderDirection: Direction.ASC }

type RequestShareFormProps = {
  currentRequest: RequestType | undefined
  onChangeValue: (key: 'name' | 'requestName' | 'usersToShare' | 'usersAssociated', value: User[] | string) => void
  error: 'error_title' | 'error_user_share_list' | null
}

const RequestShareForm: React.FC<PropsWithChildren<RequestShareFormProps>> = (
  props: PropsWithChildren<RequestShareFormProps>
) => {
  const { currentRequest, onChangeValue, error, children } = props
  const [usersSearchResults, setUsersSearchResults] = useState<User[]>([])
  const [loadingOnSearch, setLoadingOnSearch] = useState(false)
  const [usersToShare] = useState<User[]>([])
  const [searchInput, setSearchInput] = useState('')

  const debouncedSearchTerm = useDebounce(700, searchInput)

  const addUser = (user?: User | null) => {
    if (!user) return

    const _usersToShare = usersToShare ?? []
    let alreadyExists = false

    for (const _user of _usersToShare) {
      if (_user.display_name === user.display_name) {
        alreadyExists = true
      }
    }

    if (!alreadyExists) {
      _usersToShare.push(user)
    }

    onChangeValue('usersToShare', _usersToShare)
  }

  useEffect(() => {
    const _searchUsers = async () => {
      try {
        setLoadingOnSearch(true)

        const usersResp = await getUsers(orderDefault, 1, debouncedSearchTerm, true)

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

  const currentRequestLengthError =
    currentRequest?.name.length === 0
      ? 'Le nom de la requête doit comporter au moins un caractère.'
      : 'Le nom est trop long (255 caractères max.)'

  return (
    <>
      <Grid container direction="column" marginBottom={3}>
        <Typography variant="h3">Nom de la requête à partager:</Typography>
        <TextField
          placeholder="Nom de la requête"
          // value={currentRequest?.name}
          value={currentRequest?.name ? currentRequest?.name : currentRequest?.requestName}
          onChange={(e) => onChangeValue(currentRequest?.name ? 'name' : 'requestName', e.target.value)}
          autoFocus
          id="title"
          margin="normal"
          fullWidth
          error={error === ERROR_TITLE}
          helperText={error === ERROR_TITLE ? currentRequestLengthError : ''}
        />
      </Grid>

      <Grid container direction="column">
        <Typography variant="h3">Utilisateur à qui partager la requête:</Typography>
        <div style={{ display: 'flex', flexDirection: 'column', margin: '1em 0 0 0' }}>
          <Autocomplete
            noOptionsText="Rechercher un utilisateur"
            clearOnEscape
            options={usersSearchResults ?? []}
            loading={loadingOnSearch}
            onChange={(e, value) => {
              addUser(value)
              setSearchInput('')
            }}
            filterOptions={(options, { inputValue }) => options}
            onInputChange={(event, value) => setSearchInput(value)}
            getOptionLabel={(option) =>
              `${option.username} - ${option.lastname?.toLocaleUpperCase()} ${option.firstname} ${
                option.email ? `- ${option.email}` : ''
              }`
            }
            renderInput={(params) => (
              <TextField
                {...params}
                error={error === ERROR_USER_SHARE_LIST}
                helperText={error === ERROR_USER_SHARE_LIST ? 'Veuillez ajouter au moins un utilisateur' : ''}
                label="Rechercher un utilisateur"
                value={searchInput}
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
            )}
          />

          <UsersTable usersList={usersToShare} onChangeUsersAssociated={onChangeValue} usersAssociated={usersToShare} />
        </div>
      </Grid>
      <Grid container direction="column">
        {children}
      </Grid>
    </>
  )
}

export default RequestShareForm
