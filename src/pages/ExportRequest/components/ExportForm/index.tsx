/* eslint-disable max-statements */
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
  Autocomplete,
  CircularProgress,
  Alert
} from '@mui/material'

import InfoIcon from '@mui/icons-material/Info'
import { IndeterminateCheckBoxOutlined } from '@mui/icons-material'

import ExportTable from '../ExportTable'
import { useAppDispatch } from 'state'
import { showDialog } from 'state/warningDialog'

import { fetchExportableCohorts, fetchExportableCohort } from 'services/aphp/callApi'
import {
  fetchExportTablesRelationsInfo,
  fetchExportTablesInfo,
  postExportCohort
} from 'services/aphp/serviceExportCohort'

import { Cohort } from 'types'
import { TableSetting, TableInfo } from 'types/export'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { sortTables } from 'components/Dashboard/ExportModal/exportUtils'

import { getConfig } from 'config'

import useStyles from '../../styles'

export enum Error {
  ERROR_MOTIF,
  ERROR_CONDITION,
  ERROR_TABLE,
  ERROR_TABLE_LIMIT,
  ERROR_FETCH,
  NO_ERROR
}

type ErrorTables = [
  {
    tableName: string
    error: Error
  }
]

const tableSettingsInitialState: TableSetting[] = [
  {
    tableName: 'person',
    isChecked: true,
    columns: null,
    fhirFilter: null,
    respectTableRelationships: true
  }
]

const errorTablesInitialState: ErrorTables = [
  {
    tableName: 'person',
    error: Error.NO_ERROR
  }
]

const ExportForm: React.FC = () => {
  const { classes } = useStyles()
  const [error, setError] = useState<Error | null>(null)
  const [errorTables, setErrorTables] = useState<ErrorTables>(errorTablesInitialState)
  const [fetchError, setFetchError] = useState<Error | null>(null)
  const [oneFile, setOneFile] = useState<boolean>(false)
  const [exportTypeFile, setExportTypeFile] = useState<'csv' | 'xlsx'>('csv')
  const [tablesSettings, setTablesSettings] = useState<TableSetting[]>(tableSettingsInitialState)
  const [exportCohort, setExportCohort] = useState<Cohort | null>(null)
  const [exportCohortList, setExportCohortList] = useState<Cohort[] | []>([])
  const [exportTableList, setExportTableList] = useState<TableInfo[] | null>(null)
  const checkedTables = tablesSettings.filter((tableSetting) => tableSetting.isChecked)
  const [compatibilitiesTables, setCompatibilitiesTables] = useState<string[] | null>(null)
  const [conditions, setConditions] = useState<boolean>(false)
  const [motivation, setMotivation] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const cohortID = searchParams.get('groupId')
  const [loading, setLoading] = useState<boolean>(false)
  const [cohortListLoading, setCohortListLoading] = useState<boolean>(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const displayForm = cohortID !== null

  const limitError = errorTables.some((errorTable) => errorTable.error === Error.ERROR_TABLE_LIMIT)
  const fetchCountError = errorTables.some((errorTable) => errorTable.error === Error.ERROR_FETCH)

  const _checkExportableCohortID = useCallback(async () => {
    if (cohortID !== null) {
      const response = await fetchExportableCohort(cohortID)
      if (response.length === 0) {
        dispatch(
          showDialog({
            isOpen: true,
            message: `La cohorte sélectionnée n'existe pas. Veuillez sélectionner une autre cohorte.`,
            status: 'warning',
            onConfirm: () => navigate('/home')
          })
        )
      }
    }
  }, [cohortID, dispatch, navigate])

  const _fetchExportableCohorts = useCallback(async () => {
    try {
      setCohortListLoading(true)
      const response = await fetchExportableCohorts()
      setExportCohortList(response)
      setCohortListLoading(false)
    } catch (error) {
      console.error(error)
      setCohortListLoading(false)
    }
  }, [])

  const _fetchExportTablesInfo = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchExportTablesInfo()
      if (Array.isArray(response)) {
        setExportTableList(sortTables(response))
      } else if (typeof response === 'object' && response !== null) {
        setExportTableList(Object.values(sortTables(response)))
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setFetchError(Error.ERROR_FETCH)
    }
  }, [])

  console.log('manelle tablesSettings', tablesSettings)
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
      return []
    }
  }, [tablesSettings])

  useEffect(() => {
    if (fetchCountError) {
      dispatch(
        showDialog({
          isOpen: true,
          message: `Une erreur est survenue lors de la récupération du contenu des tables. Veuillez réessayer plus tard. Si le problème persiste, veuillez contacter le support: ${
            getConfig().system.mailSupport
          }.`,
          status: 'error',
          onConfirm: () => navigate('/home')
        })
      )
    }
    if (fetchError) {
      dispatch(
        showDialog({
          isOpen: true,
          message: `Une erreur est survenue lors de la récupération des tables à exporter. Veuillez réessayer ultérieurement. Si le problème persiste, veuillez contacter le support: ${
            getConfig().system.mailSupport
          }.`,
          status: 'error',
          onConfirm: () => navigate('/home')
        })
      )
    }
  }, [fetchCountError, fetchError, dispatch, navigate])

  useEffect(() => {
    _fetchExportableCohorts()
    _fetchExportTablesInfo()
    _checkExportableCohortID()
  }, [_fetchExportableCohorts, _fetchExportTablesInfo, _checkExportableCohortID])

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

  const onChangeError = (tableName: string, errorValue: Error) => {
    const newErrorTableSettings: any = tablesSettings.map((tableSetting) => {
      if (tableSetting.tableName === tableName) {
        return {
          ...tableSetting,
          error: errorValue
        }
      } else {
        return tableSetting
      }
    })
    setErrorTables(newErrorTableSettings)
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

  const mater = tablesSettings.filter((tableSetting) => tableSetting.tableName === 'QuestionnaireResponse')
  console.log('manelle mater', mater)

  const handleSubmitPayload = async () => {
    const tableToExport = tablesSettings.filter((tableSetting) => tableSetting.isChecked)

    const response = await postExportCohort({
      cohortId: exportCohort ?? { uuid: '' },
      motivation: motivation ?? '',
      group_tables: oneFile,
      outputFormat: exportTypeFile,
      tables: tableToExport
    })

    const error = response.status !== 201

    dispatch(
      showDialog({
        isOpen: true,
        message: error
          ? `Votre demande d'export a echoué. Veuillez réessayer ultérieurement. Si le problème persiste, veuillez contacter le support: ${
              getConfig().system.mailSupport
            }.`
          : "Votre demande d'export a bien été prise en compte. Vous recevrez un mail de confirmation dès que votre export sera prêt.",
        status: error ? 'error' : 'success',
        onConfirm: () => navigate('/home')
      })
    )
  }

  const handleChangeMotivation = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.value.length < 10) {
      setMotivation(e.target.value)
      setError(Error.ERROR_MOTIF)
    }
    if (e.target.value.length >= 10) {
      setMotivation(e.target.value)
      setError(null)
    }
    if (e.target.value.length === 0) {
      setMotivation(null)
      setError(null)
    }
  }

  return (
    <Grid container>
      <Grid container item className={classes.selectedCohortGrid}>
        <>
          {displayForm ? (
            <Grid container alignItems={'center'}>
              <Typography variant="h2">Cohorte sélectionnée :&nbsp;</Typography>
              <Typography variant="h3" color="#544d4d">
                {exportCohort?.name}
              </Typography>
            </Grid>
          ) : (
            <>
              <Typography className={classes.selectedCohortTypography} variant="h2">
                Sélectionner la cohorte à exporter :
              </Typography>
              <Autocomplete
                className={classes.selectedCohortAutocomplete}
                size="small"
                options={exportCohortList}
                disabled={displayForm}
                noOptionsText="Aucune cohorte disponible"
                loading={cohortListLoading}
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
            </>
          )}
        </>
      </Grid>
      {displayForm && (
        <>
          <Typography style={{ color: 'black' }}>
            Pour effectuer un export de données, veuillez renseigner un motif, sélectionner uniquement les tables que
            vous voulez exporter et accepter les conditions de l'entrepôt de données de santé (EDS). <br />
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
            label="Motif de l'export"
            variant="outlined"
            onChange={(e) => handleChangeMotivation(e)}
            error={error === Error.ERROR_MOTIF}
          />

          <Typography style={error === Error.ERROR_MOTIF ? { color: 'red' } : { color: 'black' }}>
            Le motif doit comporter au moins 10 caractères
          </Typography>

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
                  Cette fonctionnalité permet d'intégrer, dans chaque fichier généré correspondant à une table
                  sélectionnée, les données patient et visites associées.
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
                        tablesSettings.filter((tableSetting) => tableSetting.isChecked).length !==
                          tablesSettings.length &&
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
          {loading ? (
            <Grid container className={classes.exportTableGrid} justifyContent={'center'}>
              <CircularProgress />
            </Grid>
          ) : (
            <>
              {exportTableList?.map((exportTable, index: number) => (
                <ExportTable
                  key={exportTable.name + index}
                  exportCohort={exportCohort}
                  exportTable={exportTable}
                  exportTableSettings={tablesSettings}
                  setError={onChangeError}
                  addNewTableSetting={addNewTableSetting}
                  onChangeTableSettings={onChangeTableSettings}
                  compatibilitiesTables={compatibilitiesTables}
                  exportTypeFile={exportTypeFile}
                  oneFile={oneFile}
                />
              ))}
            </>
          )}

          <Grid container gap="12px" pb="10px">
            <Typography className={classes.dialogHeader} variant="h5">
              Conditions de l'EDS
            </Typography>

            <Grid item container gap="8px" justifyContent={'space-between'}>
              <Typography variant="caption" className={classes.textBody2}>
                Le niveau d’habilitation dont vous disposez dans Cohort360 vous autorise à exporter des données à
                caractère personnel conformément à la réglementation et aux règles institutionnelles d’utilisation des
                données du Système d’Information clinique de l’AP-HP. Vous êtes garant des données exportées et vous
                vous engagez à :
              </Typography>
              <Grid item container>
                <Typography variant="caption" className={classes.conditionItem}>
                  N’exporter, parmi les catégories de données accessibles, que les données strictement nécessaires et
                  pertinentes au regard des objectifs de la recherche
                </Typography>

                <Typography variant="caption" className={classes.conditionItem}>
                  À stocker temporairement les données extraites sur un répertoire dont l’accès est techniquement
                  restreint aux personnes dûment habilitées et authentifiées, présentes dans les locaux du responsable
                  de la recherche.
                </Typography>

                <Typography variant="caption" className={classes.conditionItem}>
                  À ne pas utiliser du matériel ou des supports de stockage n’appartenant pas à l’AP-HP, à ne pas sortir
                  les données des locaux de l’AP-HP ou sur un support amovible emporté hors AP-HP.
                </Typography>
                <Typography variant="caption" className={classes.conditionItem}>
                  À procéder à la destruction de toutes données exportées, dès qu’il n’y a plus nécessité d’en disposer
                  dans le cadre de la recherche dans le périmètre concerné.
                </Typography>

                <Typography variant="caption" className={classes.conditionItem}>
                  À ne pas communiquer les données à des tiers non autorisés
                </Typography>

                <Typography variant="caption" className={classes.conditionItem}>
                  À informer les chefs de services des UF de Responsabilité où ont été collectées les données exportées
                </Typography>

                <Typography variant="caption" className={classes.conditionItem}>
                  À ne pas croiser les données avec tout autre jeu de données, sans autorisation auprès de la CNIL
                </Typography>
              </Grid>

              <FormControlLabel
                control={
                  <Checkbox
                    color="secondary"
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
              <Button
                disabled={conditions === false || motivation === null || error === Error.ERROR_MOTIF || limitError}
                onClick={handleSubmitPayload}
              >
                Confirmer
              </Button>
            </Grid>
          </Grid>
          <Grid container item mb="12px" justifyContent={'flex-end'}>
            {error === Error.ERROR_MOTIF && (
              <Alert severity="error">
                Merci d'indiquer le motif de votre demande d'export, ce motif doit contenir au moins 10 caractères.
              </Alert>
            )}

            {error === Error.ERROR_CONDITION && (
              <Alert severity="error">Merci d'accepter toutes les conditions de l'Entrepôt de données de santé.</Alert>
            )}
            {error === Error.ERROR_TABLE && (
              <Alert severity="error">Merci d'indiquer les tables que vous voulez exporter.</Alert>
            )}
            {limitError && (
              <Alert severity="error">Merci d'indiquer des tables qui respectent la limite de lignes autorisées.</Alert>
            )}
          </Grid>
        </>
      )}
    </Grid>
  )
}

export default ExportForm
