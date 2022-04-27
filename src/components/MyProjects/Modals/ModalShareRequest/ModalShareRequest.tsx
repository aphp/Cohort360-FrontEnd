import React, { Fragment } from 'react'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'

const machin: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose()
    }
  }

  return (
    <Dialog open onClose={() => onClose} fullWidth maxWidth="sm" aria-labelledby="form-dialog-title">
      <DialogTitle>Partager une requete</DialogTitle>
      {/* <DialogContent>
        <Autocomplete
          noOptionsText="Recherchez un utilisateur"
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
            `${option.provider_source_value} - ${option.lastname?.toLocaleUpperCase()} ${option.firstname} - ${
              option.email
            }` ?? ''
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Rechercher un utilisateur"
              variant="outlined"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <Fragment>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </Fragment>
                )
              }}
              style={{ marginBottom: '1em' }}
            />
          )}
        />
      </DialogContent> */}
      <DialogActions>
        <Button onClick={handleClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  )
}

export default machin
