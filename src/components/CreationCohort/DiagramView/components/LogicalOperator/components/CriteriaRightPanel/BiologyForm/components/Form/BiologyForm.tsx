import React, { useEffect, useState } from 'react'

import {
  Button,
  Checkbox,
  Chip,
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
} from '@mui/material'
import Alert from '@mui/lab/Alert'

import InfoIcon from '@mui/icons-material/Info'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

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
  const [allowSearchByValue, setAllowSearchByValue] = useState(false)
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))

  const _onSubmit = () => {
    if (selectedCriteria?.code?.length === 0) {
      return setError(true)
    }

    onChangeSelectedCriteria(selectedCriteria)
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

    if (selectedCriteria?.code.length === 1 && selectedCriteria?.code[0].id !== '*') {
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
            <IconButton className={classes.backButton} onClick={goBack} size="large">
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
        {error && <Alert severity="error">Merci de renseigner un champ</Alert>}

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
          Les mesures de biologie sont pour l'instant restreintes aux 3870 codes ANABIO correspondants aux analyses les
          plus utilisées au niveau national et à l'AP-HP. De plus, les résultats concernent uniquement les analyses
          quantitatives enregistrées sur GLIMS, qui ont été validées et mises à jour depuis mars 2020.
        </Alert>

        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">Biologie</Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
            defaultValue="Critères de biologie"
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

          <Grid className={classes.inputContainer}>
            <Typography variant="h6">Codes de biologie</Typography>

            <Grid container item style={{ margin: '1em 0px', width: 'calc(100%-2em)' }}>
              {defaultValuesCode.length > 0 ? (
                defaultValuesCode.map((valueCode: any, index: number) => (
                  <Chip
                    key={index}
                    style={{ margin: 3 }}
                    label={
                      <Tooltip title={valueCode.label}>
                        <Typography style={{ maxWidth: 500 }} noWrap>
                          {valueCode.label}
                        </Typography>
                      </Tooltip>
                    }
                    onDelete={() =>
                      onChangeValue(
                        'code',
                        defaultValuesCode.filter((code: any) => code !== valueCode)
                      )
                    }
                  />
                ))
              ) : (
                <FormLabel style={{ margin: 'auto 1em' }} component="legend">
                  Veuillez ajouter des codes de biologie via les onglets Hiérarchie ou Recherche.
                </FormLabel>
              )}
            </Grid>

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
                gridTemplateColumns: selectedCriteria.valueComparator === '<x>' ? '50px 1fr 1fr 1fr' : '50px 1fr 1fr',
                alignItems: 'center',
                marginTop: '1em'
              }}
            >
              <Checkbox
                color="primary"
                checked={allowSearchByValue}
                onClick={() => setAllowSearchByValue(!allowSearchByValue)}
                disabled={!selectedCriteria.isLeaf}
              />

              <Select
                style={{ marginRight: '1em' }}
                id="biology-value-comparator-select"
                value={selectedCriteria.valueComparator}
                onChange={(event) => onChangeValue('valueComparator', event.target.value as string)}
                variant="outlined"
                disabled={!allowSearchByValue}
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
                value={selectedCriteria.valueMin}
                onChange={(e) => onChangeValue('valueMin', e.target.value)}
                placeholder={selectedCriteria.valueComparator === '<x>' ? 'Valeur minimale' : ''}
                disabled={!allowSearchByValue}
              />
              {selectedCriteria.valueComparator === '<x>' && (
                <TextField
                  required
                  inputProps={{
                    min: 1
                  }}
                  type="number"
                  id="criteria-value"
                  value={selectedCriteria.valueMax}
                  onChange={(e) => onChangeValue('valueMax', e.target.value)}
                  placeholder="Valeur maximale"
                  disabled={!allowSearchByValue}
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
