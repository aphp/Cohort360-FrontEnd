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
          label: code.label ? code.label : criteriaCode?.label ?? '?'
        }
      })
    : []

  useEffect(() => {
    const checkChildren = async () => {
      try {
        const getChildrenResp = await criteria.fetch.fetchBiologyHierarchy(selectedCriteria.code[0].id)

        if (getChildrenResp.length > 0) {
          onChangeValue('isLeaf', false)
        } else {
          onChangeValue('isLeaf', true)
        }
      } catch (error) {
        console.error('Erreur lors du check des enfants du code de biologie sélectionné', error)
      }
    }

    if (selectedCriteria.code.length === 1) {
      checkChildren()
    } else {
      onChangeValue('isLeaf', false)
    }
  }, [selectedCriteria.code])

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

        <Alert severity="warning">
          Les mesures de biologie sont pour l'instant restreintes aux 3300 codes d'analyse du référentiel qui
          représentent XX% des résultats intégrés à l'EDS. De plus, les résultats concernent uniquement les analyses
          quantitatives enregistrées sur GLIMS V9 qui ont été créés et mises à jours depuis mars 2020.
        </Alert>

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

            <Grid
              style={{
                display: 'grid',
                gridTemplateColumns: selectedCriteria.valueComparator === '<x>' ? '100px 1fr 1fr' : '100px 1fr',
                alignItems: 'center'
              }}
            >
              <Select
                style={{ marginRight: '1em' }}
                id="biology-value-comparator-select"
                value={selectedCriteria.valueComparator}
                onChange={(event) => onChangeValue('valueComparator', event.target.value as string)}
                variant="outlined"
                disabled={!selectedCriteria.isLeaf}
              >
                <MenuItem value={'<='}>{'<='}</MenuItem>
                <MenuItem value={'<'}>{'<'}</MenuItem>
                <MenuItem value={'='}>{'='}</MenuItem>
                <MenuItem value={'>'}>{'>'}</MenuItem>
                <MenuItem value={'>='}>{'>='}</MenuItem>
                <MenuItem value={'<x>'}>{'< X >'}</MenuItem>
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
                onChange={(e) => onChangeValue('valueMin', e.target.value)}
                placeholder={selectedCriteria.valueComparator === '<x>' ? 'Valeur minimale' : ''}
                disabled={!selectedCriteria.isLeaf}
              />
              {selectedCriteria.valueComparator === '<x>' && (
                <TextField
                  required
                  inputProps={{
                    min: 1
                  }}
                  type="number"
                  id="criteria-value"
                  variant="outlined"
                  value={selectedCriteria.valueMax}
                  onChange={(e) => onChangeValue('valueMax', e.target.value)}
                  placeholder="Valeur maximale"
                  disabled={!selectedCriteria.isLeaf}
                />
              )}

              {/* TODO: gérer l'erreur si valumin > valuemax */}
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
