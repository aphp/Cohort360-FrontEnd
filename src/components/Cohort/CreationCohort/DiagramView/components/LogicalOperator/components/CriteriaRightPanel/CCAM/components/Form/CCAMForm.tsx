import React, { useState } from 'react'

import { Button, Divider, FormLabel, Grid, IconButton, Switch, TextField, Typography } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'

import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { InputAutocompleteAsync as AutocompleteAsync } from 'components/Inputs'

import AdvancedInputs from '../../../AdvancedInputs/AdvancedInputs'

import useStyles from './styles'

type CcamFormProps = {
  isEdition: boolean
  criteria: any
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const CcamForm: React.FC<CcamFormProps> = (props) => {
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

  const getCCAMOptions = async (searchValue: string) => {
    const ccamOptions = await criteria.fetch.fetchCcamData(searchValue, false)

    return ccamOptions && ccamOptions.length > 0 ? ccamOptions : []
  }

  const defaultValuesCode = selectedCriteria.code
    ? selectedCriteria.code.map((code: any) => {
        const criteriaCode = criteria.data.ccamData ? criteria.data.ccamData.find((g: any) => g.id === code.id) : null
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
            <Typography className={classes.titleLabel}>Ajouter un critère d'acte CCAM</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère d'acte CCAM</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        {error && <Alert severity="error">Merci de renseigner un acte CCAM</Alert>}

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
          <Typography variant="h6">Actes CCAM</Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
            defaultValue="Critères d'actes CCAM"
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
            label="Codes d'actes CCAM"
            variant="outlined"
            noOptionsText="Veuillez entrer un code ou un acte CCAM"
            className={classes.inputItem}
            autocompleteValue={defaultValuesCode}
            autocompleteOptions={criteria?.data?.ccamData || []}
            getAutocompleteOptions={getCCAMOptions}
            onChange={(e, value) => onChangeValue('code', value)}
          />

          <AdvancedInputs form="ccam" selectedCriteria={selectedCriteria} onChangeValue={onChangeValue} />
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

export default CcamForm
