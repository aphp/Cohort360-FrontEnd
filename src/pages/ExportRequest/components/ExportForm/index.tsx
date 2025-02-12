import React, { useState, useCallback, useEffect } from 'react'

import {
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tooltip,
  IconButton,
  Button,
  Autocomplete
} from '@mui/material'

import InfoIcon from '@mui/icons-material/Info'
import { IndeterminateCheckBoxOutlined } from '@mui/icons-material'

import ExportTable from '../ExportTable'

import { fetchExportableCohorts } from 'services/aphp/callApi'
import {
  fetchExportTablesRelationsInfo,
  fetchExportTablesInfo,
  postExportCohort
} from 'services/aphp/serviceExportCohort'

import { Cohort } from 'types'
import { TableSetting, TableInfo } from 'types/export'
import { useSearchParams } from 'react-router-dom'

import useStyles from '../../styles'

const tableSettingsInitialState: TableSetting[] = [
  {
    tableName: 'person',
    isChecked: true,
    columns: null,
    fhirFilter: null,
    respectTableRelationships: true,
    pivotMerge: null
  }
]

const ExportForm: React.FC = () => {
  const { classes } = useStyles()
  const [error, setError] = useState<any>('')
  const [oneFile, setOneFile] = useState<boolean>(false)
  const [exportTypeFile, setExportTypeFile] = useState<'csv' | 'xlsx'>('csv')
  const [tablesSettings, setTablesSettings] = useState<TableSetting[]>(tableSettingsInitialState)
  const [exportCohort, setExportCohort] = useState<Cohort | null>(null)
  const [exportCohortList, setExportCohortList] = useState<Cohort[] | []>([])
  const [exportTableList, setExportTableList] = useState<TableInfo[] | null>(null)
  const checkedTables = tablesSettings.filter((tableSetting) => tableSetting.isChecked)
  const [compatibilitiesTables, setCompatibilitiesTables] = useState<string[] | null>(null)
  const [conditions, setConditions] = useState<boolean>(false)
  const [motivation, setMotivation] = useState<string>('')
  const [searchParams, setSearchParams] = useSearchParams()
  const cohortID = searchParams.get('groupId')

  const _fetchExportableCohorts = useCallback(async () => {
    try {
      const response = await fetchExportableCohorts()
      setExportCohortList(response)
    } catch (error) {
      console.error(error)
    }
  }, [])

  const _fetchExportTablesInfo = useCallback(async () => {
    try {
      const response = await fetchExportTablesInfo()
      setExportTableList(response)
    } catch (error) {
      return []
    }
  }, [])

  const _fetchCompatibilitiesTables = useCallback(async () => {
    const tableList = tablesSettings
      .map((tableSetting) => {
        if (tableSetting.isChecked) {
          return tableSetting.tableName
        }
      })
      .filter((table) => table !== undefined)
    try {
      const response = await fetchExportTablesRelationsInfo(tableList as string[])
      setCompatibilitiesTables(response)
    } catch (e) {
      console.log('error', e)
      return []
    }
  }, [tablesSettings])

  useEffect(() => {
    _fetchExportableCohorts()
    _fetchExportTablesInfo()
  }, [_fetchExportableCohorts, _fetchExportTablesInfo])

  useEffect(() => {
    if (cohortID !== null) {
      setExportCohort(exportCohortList.find((cohort) => cohort.group_id === cohortID) ?? null)
    }
  }, [cohortID, exportCohortList])

  useEffect(() => {
    if (oneFile) {
      _fetchCompatibilitiesTables()
    }
  }, [oneFile, _fetchCompatibilitiesTables])

  const addNewTableSetting = (arg: TableSetting) => {
    setTablesSettings([...tablesSettings, arg])
  }

  const onChangeTableSettings = (tableName: string, key: any, value: any) => {
    const newTableSettings: TableSetting[] = tablesSettings.map((tableSetting) => {
      if (tableSetting.tableName === tableName) {
        return {
          ...tableSetting,
          [key]: value
        }
      } else {
        return tableSetting
      }
    })
    setTablesSettings(newTableSettings)
  }

  const resetSelectedTables = () => {
    const newSelectedTables = tablesSettings.map((tableSetting) => ({
      ...tableSetting,
      isChecked: tableSetting.tableName === 'person'
    }))
    setTablesSettings(newSelectedTables)
  }

  const handleSelectAllTables = () => {
    const newSelectedTables = tablesSettings.map((tableSetting) => ({
      ...tableSetting,
      isChecked: tableSetting.tableName !== 'person' ? tablesSettings.length !== checkedTables.length : true
    }))
    setTablesSettings(newSelectedTables)
  }

  const handleSubmitPayload = () => {
    const tableToExport = tablesSettings.filter((tableSetting) => tableSetting.isChecked)

    postExportCohort({
      cohortId: exportCohort ?? { uuid: '' },
      motivation: motivation,
      group_tables: oneFile,
      outputFormat: exportTypeFile,
      tables: tableToExport
    })
  }

  return (
    <Grid container>
      <Typography style={{ color: 'black' }}>
        Pour effectuer un export de données, veuillez renseigner un motif, sélectionner uniquement les tables que vous
        voulez exporter et accepter les conditions de l'entrepôt de données de santé (EDS). <br />
        Tous les champs sont obligatoires
      </Typography>

      <TextField
        id="motif"
        multiline
        autoFocus
        fullWidth
        minRows={3}
        maxRows={5}
        style={{ marginTop: '20px', backgroundColor: 'white' }}
        value={motivation}
        FormHelperTextProps={{ className: classes.helperText }}
        label="Motif de l'export"
        variant="outlined"
        onChange={(e) => setMotivation(e.target.value)}
        error={error}
      />

      <Typography style={error ? { color: 'red' } : { color: 'black' }}>
        Le motif doit comporter au moins 10 caractères
      </Typography>

      <Grid container item className={classes.selectedCohortGrid}>
        <Typography className={classes.selectedCohortTypography} variant="h2">
          Sélectionner la cohorte à exporter :
        </Typography>
        <Autocomplete
          className={classes.selectedCohortAutocomplete}
          size="small"
          // disabled={tableSetting?.isChecked === false}
          options={exportCohortList}
          noOptionsText="Aucune cohorte disponible"
          getOptionLabel={(option) => {
            return `${option.name}`
          }}
          renderInput={(params) => <TextField {...params} label="Sélectionnez une Cohorte" />}
          value={exportCohort}
          onChange={(_, value) => {
            setExportCohort(value)
            setSearchParams(`groupId=${value?.group_id}`)
          }}
        />
      </Grid>

      <Grid container className={classes.oneFileGrid} alignItems="center">
        <FormControlLabel
          control={
            <Checkbox
              checked={oneFile}
              onClick={() => {
                setOneFile(!oneFile)
                resetSelectedTables()
              }}
            />
          }
          label={'Regrouper plusieurs tables en un seul fichier'}
        />
        <Tooltip
          title={
            <span>
              Cette fonctionnalité permet d'intégrer, dans chaque fichier généré correspondant à une table sélectionnée,
              les données patient et visites associées.
            </span>
          }
        >
          <InfoIcon fontSize="small" color="primary" />
        </Tooltip>
      </Grid>

      <Grid item container alignItems="center" flexWrap="nowrap">
        <Grid item container xs={3}>
          <Typography className={classes.dialogHeader} variant="h5">
            Tables exportées
          </Typography>

          <IconButton
            size="small"
            onClick={() =>
              window.open(
                `https://id.pages.data.aphp.fr/pfm/bigdata/eds-central-database/latest/data_catalog/`,
                '_blank'
              )
            }
          >
            <InfoIcon />
          </IconButton>
        </Grid>

        <Grid container className={classes.fileTypeGrid} xs={5}>
          <Typography variant="h3">Type de fichier : </Typography>
          <Select
            className={classes.fileTypeSelect}
            style={{ height: 32 }}
            id="file-type-selector"
            value={exportTypeFile}
            onChange={(event) => setExportTypeFile(event.target.value as 'csv' | 'xlsx')}
          >
            <MenuItem value={'csv'}>{'Fichier csv'}</MenuItem>
            <MenuItem value={'xlsx'}>{'Fichier excel (.xlsx)'}</MenuItem>
          </Select>
        </Grid>

        {oneFile !== true && (
          <Grid item xs={4} container className={classes.selectAllTablesGrid}>
            <FormControlLabel
              className={classes.selectAllTablesFormControl}
              control={
                <Checkbox
                  color="secondary"
                  indeterminate={
                    tablesSettings.filter((tableSetting) => tableSetting.isChecked).length !== tablesSettings.length &&
                    tablesSettings.filter((tableSetting) => tableSetting.isChecked).length > 0
                  }
                  indeterminateIcon={<IndeterminateCheckBoxOutlined style={{ color: 'rgba(0,0,0,0.6)' }} />}
                  checked={
                    tablesSettings.filter((tableSetting) => tableSetting.isChecked).length === tablesSettings.length
                  }
                  onChange={handleSelectAllTables}
                />
              }
              label={
                tablesSettings.filter((tableSetting) => tableSetting.isChecked).length === tablesSettings.length
                  ? 'Tout désélectionner'
                  : 'Tout sélectionner'
              }
              labelPlacement="start"
            />
          </Grid>
        )}
      </Grid>

      <Grid>
        {exportTableList?.map((exportTable, index: number) => (
          <div
            style={{
              padding: '16px 16px 16px 16px',
              backgroundColor: 'white',
              marginBottom: '10px',
              borderColor: 'grey',
              borderRadius: 9,
              border: 'solid',
              borderWidth: 1.5
            }}
            key={exportTable.name + index}
          >
            <ExportTable
              exportCohort={exportCohort}
              exportTable={exportTable}
              exportTableSettings={tablesSettings}
              setError={setError}
              addNewTableSetting={addNewTableSetting}
              onChangeTableSettings={onChangeTableSettings}
              compatibilitiesTables={compatibilitiesTables}
              exportTypeFile={exportTypeFile}
              oneFile={oneFile}
            />
          </div>
        ))}
      </Grid>

      <Grid container gap="12px" pb="10px">
        <Typography className={classes.dialogHeader} variant="h5">
          Conditions de l'EDS
        </Typography>

        <Grid item container gap="8px" justifyContent={'space-between'}>
          <Typography variant="caption" className={classes.textBody2}>
            Le niveau d’habilitation dont vous disposez dans Cohort360 vous autorise à exporter des données à caractère
            personnel conformément à la réglementation et aux règles institutionnelles d’utilisation des données du
            Système d’Information clinique de l’AP-HP. Vous êtes garant des données exportées et vous vous engagez à :
          </Typography>
          <Grid item container>
            <Typography variant="caption" className={classes.conditionItem}>
              N’exporter, parmi les catégories de données accessibles, que les données strictement nécessaires et
              pertinentes au regard des objectifs de la recherche
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              A stocker temporairement les données extraites sur un répertoire dont l’accès est techniquement restreint
              aux personnes dûment habilitées et authentifiées, présentes dans les locaux du responsable de la
              recherche.
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              A ne pas utiliser du matériel ou des supports de stockage n’appartenant pas à l’AP-HP, à ne pas sortir les
              données des locaux de l’AP-HP ou sur un support amovible emporté hors AP-HP.
            </Typography>
            <Typography variant="caption" className={classes.conditionItem}>
              A procéder à la destruction de toutes données exportées, dès qu’il n’y a plus nécessité d’en disposer dans
              le cadre de la recherche dans le périmètre concerné.
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              A ne pas communiquer les données à des tiers non autorisés
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              A informer les chefs de services des UF de Responsabilité où ont été collectées les données exportées
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              A ne pas croiser les données avec tout autre jeu de données, sans autorisation auprès de la CNIL
            </Typography>
          </Grid>

          <FormControlLabel
            className={classes.selectAgreeConditions}
            control={
              <Checkbox
                color="secondary"
                className={classes.agreeCheckbox}
                name="conditions"
                checked={conditions}
                onChange={() => setConditions(!conditions)}
              />
            }
            labelPlacement="end"
            label={
              <Typography variant="caption" className={classes.textBody1}>
                Je reconnais avoir lu et j'accepte les conditions ci-dessus
              </Typography>
            }
          />
          <Button disabled={conditions === false} onClick={handleSubmitPayload}>
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ExportForm
