import React, { useState } from 'react'

import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  Input,
  InputLabel,
  IconButton,
  MenuItem,
  Switch,
  Typography,
  Tooltip,
  TextField,
  Select
} from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'

import ClearIcon from '@material-ui/icons/Clear'
import InfoIcon from '@material-ui/icons/Info'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { InputAutocompleteAsync as AutocompleteAsync } from 'components/Inputs'

import useStyles from './styles'

type GHMFormProps = {
  isEdition: boolean
  criteria: any
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const GhmForm: React.FC<GHMFormProps> = (props) => {
  const { isEdition, criteria, selectedCriteria, onChangeValue, goBack, onChangeSelectedCriteria } = props

  const classes = useStyles()

  const [error, setError] = useState(false)
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))

  const _onSubmit = () => {
    if (selectedCriteria?.code?.length === 0) {
      return setError(true)
    }

    onChangeSelectedCriteria(selectedCriteria)
  }

  const getGhmOptions = async (searchValue: string) => await criteria.fetch.fetchGhmData(searchValue, false)

  const defaultValuesCode = selectedCriteria.code
    ? selectedCriteria.code.map((code: any) => {
        const criteriaCode = criteria.data.ghmData ? criteria.data.ghmData.find((g: any) => g.id === code.id) : null
        return {
          id: code.id,
          label: code.label ? code.label : criteriaCode?.label ?? '?'
        }
      })
    : []

  return (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        {!isEdition ? (
          <>
            <IconButton className={classes.backButton} onClick={goBack}>
              <KeyboardBackspaceIcon />
            </IconButton>
            <Divider className={classes.divider} orientation="vertical" flexItem />
            <Typography className={classes.titleLabel}>Ajouter un critère de GHM</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de GHM</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        {error && <Alert severity="error">Merci de renseigner un code GHM</Alert>}

        {!error && !multiFields && (
          <Alert
            severity="info"
            onClose={() => {
              localStorage.setItem('multiple_fields', 'ok')
              setMultiFields('ok')
            }}
          >
            Tous les éléments des champs multiples sont liés par une contrainte OU
          </Alert>
        )}

        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">GHM</Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
            defaultValue="Critères GHM"
            variant="outlined"
            value={selectedCriteria.title}
            onChange={(e) => onChangeValue('title', e.target.value)}
          />

          <Grid style={{ display: 'flex' }}>
            <FormLabel
              onClick={() => onChangeValue('isInclusive', !selectedCriteria.isInclusive)}
              style={{ margin: 'auto 1em' }}
              component="legend"
            >
              Exclure les patients qui suivent les règles suivantes
            </FormLabel>
            <Switch
              id="criteria-inclusive"
              checked={!selectedCriteria.isInclusive}
              onChange={(event) => onChangeValue('isInclusive', !event.target.checked)}
            />
          </Grid>

          <AutocompleteAsync
            multiple
            label="Codes GHM"
            variant="outlined"
            noOptionsText="Veuillez entrer un code ou un critère GHM"
            className={classes.inputItem}
            autocompleteValue={defaultValuesCode}
            autocompleteOptions={criteria?.data?.ghmData || []}
            getAutocompleteOptions={getGhmOptions}
            onChange={(e, value) => onChangeValue('code', value)}
          />

          <FormLabel style={{ padding: '0 1em 8px', display: 'flex', alignItems: 'center' }} component="legend">
            Nombre d'occurrence
            <Tooltip
              title={
                <>
                  {
                    "Si vous choisissez un chapitre, le nombre d'occurrence ne s'applique pas sur un unique élément de ce chapitre, mais sur l'ensemble des éléments de ce chapitre."
                  }
                  <br />
                  <br />
                  {
                    "Exemple: Nombre d'occurrences >= 3 sur un chapitre signifie que l'on inclus les patients qui ont eu au moins 3 éléments de ce chapitre, distincts ou non"
                  }
                </>
              }
            >
              <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
            </Tooltip>
          </FormLabel>

          <Grid style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', margin: '0 1em' }}>
            <Select
              style={{ marginRight: '1em' }}
              id="criteria-occurrenceComparator-select"
              value={selectedCriteria.occurrenceComparator}
              onChange={(event) => onChangeValue('occurrenceComparator', event.target.value as string)}
              variant="outlined"
            >
              <MenuItem value={'<='}>{'<='}</MenuItem>
              <MenuItem value={'<'}>{'<'}</MenuItem>
              <MenuItem value={'='}>{'='}</MenuItem>
              <MenuItem value={'>'}>{'>'}</MenuItem>
              <MenuItem value={'>='}>{'>='}</MenuItem>
            </Select>

            <TextField
              required
              inputProps={{
                min: 1
              }}
              type="number"
              id="criteria-occurrence-required"
              variant="outlined"
              value={selectedCriteria.occurrence}
              onChange={(e) => onChangeValue('occurrence', e.target.value)}
            />
          </Grid>

          <FormLabel style={{ padding: '1em 1em 0 1em' }} component="legend">
            Date d'occurrence
          </FormLabel>

          <Grid style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <FormControl className={classes.inputItem}>
              <InputLabel shrink htmlFor="date-start-occurrence">
                Avant le
              </InputLabel>
              <Input
                id="date-start-occurrence"
                type="date"
                value={selectedCriteria.startOccurrence}
                endAdornment={
                  <IconButton size="small" onClick={() => onChangeValue('startOccurrence', '')}>
                    <ClearIcon />
                  </IconButton>
                }
                onChange={(e) => onChangeValue('startOccurrence', e.target.value)}
              />
            </FormControl>

            <FormControl className={classes.inputItem}>
              <InputLabel shrink htmlFor="date-end-occurrence">
                Après le
              </InputLabel>
              <Input
                id="date-end-occurrence"
                type="date"
                value={selectedCriteria.endOccurrence}
                endAdornment={
                  <IconButton size="small" onClick={() => onChangeValue('endOccurrence', '')}>
                    <ClearIcon />
                  </IconButton>
                }
                onChange={(e) => onChangeValue('endOccurrence', e.target.value)}
              />
            </FormControl>
          </Grid>
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} color="primary" variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_onSubmit} type="submit" form="cim10-form" color="primary" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default GhmForm
