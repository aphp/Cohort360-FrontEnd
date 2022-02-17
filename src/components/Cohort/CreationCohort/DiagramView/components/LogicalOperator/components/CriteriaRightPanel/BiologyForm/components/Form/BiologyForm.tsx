import React, { useEffect, useState } from 'react'

import {
  Button,
  Divider,
  FormLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'

import InfoIcon from '@material-ui/icons/Info'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { InputAutocompleteAsync as AutocompleteAsync } from 'components/Inputs'

import AdvancedInputs from '../../../AdvancedInputs/AdvancedInputs'

import useStyles from './styles'

type BiologyFormProps = {
  isEdition: boolean
  criteria: any
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const BiologyForm: React.FC<BiologyFormProps> = (props) => {
  const { isEdition, criteria, selectedCriteria, onChangeValue, goBack, onChangeSelectedCriteria } = props

  const classes = useStyles()

  const [error, setError] = useState(false)
  const [valuesError, setValuesError] = useState(false)
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))

  const _onSubmit = () => {
    if (selectedCriteria?.code?.length === 0) {
      return setError(true)
    }

    onChangeSelectedCriteria(selectedCriteria)
  }

  const getBiologyOptions = async (searchValue: string) => {
    const biologyOptions = await criteria.fetch.fetchBiologyData(searchValue, false)

    return biologyOptions && biologyOptions.length > 0 ? biologyOptions : []
  }

  const defaultValuesCode = selectedCriteria.code
    ? selectedCriteria.code.map((code: any) => {
        const criteriaCode = criteria.data.biologyData
          ? criteria.data.biologyData.find((g: any) => g.id === code.id)
          : null
        return {
          id: code.id,
          label: code.label ? code.label : criteriaCode?.label ?? '?',
          // TODO: checker si c'est si facile d'ajouter isLeaf vvv
          isLeaf: code.isLeaf
        }
      })
    : []

  // useEffect sur selectedCriteria.code pour checker s'il y a des enfants

  useEffect(() => {
    if (selectedCriteria.valueMin < selectedCriteria.valueMax) {
      setValuesError(true)
    } else {
      setValuesError(false)
    }
  }, [selectedCriteria.valueMax])

  return (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        {!isEdition ? (
          <>
            <IconButton className={classes.backButton} onClick={goBack}>
              <KeyboardBackspaceIcon />
            </IconButton>
            <Divider className={classes.divider} orientation="vertical" flexItem />
            <Typography className={classes.titleLabel}>Ajouter un critère de biologie</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de biologie</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        {error && <Alert severity="error">Merci de renseigner un champs</Alert>}

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
          <Typography variant="h6">Biologie</Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
            defaultValue="Critères de biologie"
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
            label="Codes de biologie"
            variant="outlined"
            noOptionsText="Veuillez entrer un code ou un libellé"
            className={classes.inputItem}
            autocompleteValue={defaultValuesCode}
            autocompleteOptions={criteria?.data?.biologyData || []}
            getAutocompleteOptions={getBiologyOptions}
            onChange={(e, value) => onChangeValue('code', value)}
          />

          <Grid className={classes.inputContainer}>
            <Grid item container direction="row" alignItems="center">
              <Typography variant="h6">Recherche par valeur</Typography>
              <Tooltip
                title="Pour pouvoir rechercher par valeur, vous devez sélectionner un seul et unique analyte (élement le plus
                fin de la hiérarchie)."
              >
                <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
              </Tooltip>
            </Grid>

            {/* TODO: disable si code != niveau feuille */}

            <Grid style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
              <Select
                style={{ marginRight: '1em' }}
                id="biology-value-comparator-select"
                value={selectedCriteria.valueComparator}
                onChange={(event) => onChangeValue('valueComparator', event.target.value as string)}
                variant="outlined"
                // TODO: isLeaf existe?
                disabled={!selectedCriteria.isLeaf}
              >
                <MenuItem value={'<='}>{'<='}</MenuItem>
                <MenuItem value={'<'}>{'<'}</MenuItem>
                <MenuItem value={'='}>{'='}</MenuItem>
                <MenuItem value={'>'}>{'>'}</MenuItem>
                <MenuItem value={'>='}>{'>='}</MenuItem>
                <MenuItem value={'<X>'}>{'< X >'}</MenuItem>
              </Select>

              <TextField
                required
                inputProps={{
                  min: 1
                }}
                type="number"
                id="criteria-value"
                variant="outlined"
                value={selectedCriteria.valueMin}
                onChange={(e) => onChangeValue('value', e.target.value)}
                // TODO: isLeaf existe?
                disabled={!selectedCriteria.isLeaf}
              />
              {selectedCriteria.valueComparator === '<X>' && (
                <TextField
                  error={valuesError}
                  required
                  inputProps={{
                    min: 1
                  }}
                  type="number"
                  id="criteria-value"
                  variant="outlined"
                  value={selectedCriteria.valueMax}
                  onChange={(e) => onChangeValue('value', e.target.value)}
                  // TODO: isLeaf existe?
                  disabled={!selectedCriteria.isLeaf}
                />
              )}

              {/* TODO: ajouter textfield 2 si value comparator = <X> */}
            </Grid>
          </Grid>

          <AdvancedInputs form="biology" selectedCriteria={selectedCriteria} onChangeValue={onChangeValue} />
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} color="primary" variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_onSubmit} type="submit" form="biology-form" color="primary" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default BiologyForm
