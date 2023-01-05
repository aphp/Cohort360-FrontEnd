import React, { useState, useEffect, Fragment } from 'react'

import { Grid, TextField, Typography, CircularProgress } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'

import { RequestType, Provider, Order } from 'types'

import { getProviders } from 'services/aphp/serviceProviders'

import ProvidersTable from './providersTable'
import useStyles from '../styles'
import { useDebounce } from 'utils/debounce'

const ERROR_TITLE = 'error_title'
const ERROR_USER_SHARE_LIST = 'error_user_share_list'

const orderDefault = { orderBy: 'lastname', orderDirection: 'asc' } as Order

type RequestShareFormProps = {
  currentRequest: RequestType | undefined
  onChangeValue: (key: 'name' | 'requestName' | 'usersToShare', value: string | string | Provider[]) => void
  error: 'error_title' | 'error_user_share_list' | null
}

const RequestShareForm: React.FC<RequestShareFormProps> = ({ currentRequest, onChangeValue, error }) => {
  const [providersSearchResults, setProvidersSearchResults] = useState<Provider[]>([])
  const [loadingOnSearch, setLoadingOnSearch] = useState(false)
  const [usersToShare] = useState<Provider[]>([])
  const [searchInput, setSearchInput] = useState('')
  const classes = useStyles()

  const debouncedSearchTerm = useDebounce(700, searchInput)

  const addProvider = (provider?: Provider | null) => {
    if (!provider) return

    const _usersToShare = usersToShare ?? []
    let alreadyExists = false

    for (const user of _usersToShare) {
      if (user.displayed_name === provider.displayed_name) {
        alreadyExists = true
      }
    }

    if (!alreadyExists) {
      _usersToShare.push(provider)
    }

    onChangeValue('usersToShare', _usersToShare)
  }

  useEffect(() => {
    const _searchProviders = async () => {
      try {
        setLoadingOnSearch(true)

        const providersResp = await getProviders(orderDefault, 1, debouncedSearchTerm)

        setProvidersSearchResults(providersResp.providers)

        setLoadingOnSearch(false)
      } catch (error) {
        console.error('Erreur lors de la recherche des utilisateurs')
        setProvidersSearchResults([])
        setLoadingOnSearch(false)
      }
    }

    if (debouncedSearchTerm && debouncedSearchTerm?.length > 0) {
      _searchProviders()
    } else {
      setProvidersSearchResults([])
    }
  }, [debouncedSearchTerm])

  return (
    <>
      <Grid container direction="column" className={classes.inputContainer}>
        <Typography variant="h3">Nom de la requête à partager:</Typography>
        <TextField
          placeholder="Nom de la requête"
          // value={currentRequest?.name}
          value={currentRequest?.name ? currentRequest?.name : currentRequest?.requestName}
          onChange={(e: any) => onChangeValue(currentRequest?.name ? 'name' : 'requestName', e.target.value)}
          autoFocus
          id="title"
          margin="normal"
          variant="outlined"
          fullWidth
          error={error === ERROR_TITLE}
          helperText={
            error === ERROR_TITLE
              ? currentRequest?.name.length === 0
                ? 'Le nom de la requête doit comporter au moins un caractère.'
                : 'Le nom est trop long (255 caractères max.)'
              : ''
          }
        />
      </Grid>

      <Grid container direction="column" className={classes.inputContainer}>
        <Typography variant="h3">Utilisateur à qui partager la requête:</Typography>
        <div style={{ display: 'flex', flexDirection: 'column', margin: '1em' }}>
          <Autocomplete
            noOptionsText="Rechercher un utilisateur"
            clearOnEscape
            options={providersSearchResults ?? []}
            loading={loadingOnSearch}
            onChange={(e, value) => {
              addProvider(value)
              setSearchInput('')
            }}
            inputValue={searchInput}
            onInputChange={() => setSearchInput('')}
            getOptionLabel={(option) =>
              `${option.provider_source_value} - ${option.lastname?.toLocaleUpperCase()} ${option.firstname} ${
                option.email ? `- ${option.email}` : ''
              }` ?? ''
            }
            renderInput={(params) => (
              <TextField
                {...params}
                error={error === ERROR_USER_SHARE_LIST}
                helperText={error === ERROR_USER_SHARE_LIST ? 'Veuillez ajouter au moins un utilisateur' : ''}
                label="Rechercher un utilisateur"
                variant="outlined"
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

          <ProvidersTable
            providersList={usersToShare}
            onChangeUsersAssociated={onChangeValue}
            usersAssociated={usersToShare}
          />
        </div>
      </Grid>
    </>
  )
}

export default RequestShareForm
