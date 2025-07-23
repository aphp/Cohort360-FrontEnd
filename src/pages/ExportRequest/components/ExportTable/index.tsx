/**
 * @fileoverview Export table component for configuring individual table export settings.
 * This component handles table selection, column filtering, FHIR filtering,
 * and special configurations like pivot mode for questionnaire responses.
 */

/* eslint-disable max-statements */
import React, { useCallback, useContext, useEffect, useState } from 'react'

import {
  Grid,
  Typography,
  TextField,
  Checkbox,
  Autocomplete,
  CircularProgress,
  ListItemText,
  IconButton,
  Switch
} from '@mui/material'

import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import SearchOutlined from '@mui/icons-material/SearchOutlined'

import Chip from 'components/ui/Chip'
import CustomAlert from 'components/ui/Alert'
import useStyles from '../../styles'
import {
  getResourceType,
  getExportTableLabel,
  fetchResourceCount2,
  fetchQuestionnaireResponseCountDetails
} from 'pages/ExportRequest/components/exportUtils'
import { ResourceType } from 'types/requestCriterias'
import { getProviderFilters } from 'services/aphp/serviceFilters'
import { useAppSelector, useAppDispatch } from 'state'
import { showDialog, hideDialog } from 'state/warningDialog'
import { AppConfig } from 'config'

import { Cohort } from 'types'
import { TableInfo, TableSetting } from 'types/export'

import { Error } from '../ExportForm'
import QuestionForm, { QuestionLeaf } from 'pages/ExportRequest/components/QuestionChoice'

/**
 * Props interface for the ExportTable component.
 */
type ExportTableProps = {
  exportTable: TableInfo
  exportTableSettings: TableSetting | undefined
  exportCohort: Cohort | null
  setError: (tableName: string, errorValue: Error) => void
  addNewTableSetting: (newTableSetting: TableSetting) => void
  removeTableSetting: (tableName: string) => void
  onChangeTableSettings: ([{ tableName, key, value }]: { tableName: string; key: any; value: any }[]) => void
  compatibilitiesTables: string[] | null
  exportTypeFile: 'xlsx' | 'csv'
  oneFile: boolean
}

/**
 * Alert component that warns users about Excel format limitations.
 *
 * @returns {JSX.Element} Warning alert for Excel format limitations
 */
const AlertLimitXlsx: React.FC = () => {
  const message =
    "Attention, le format excel étant limité à 32.000 caractères par cellule, le contenu de certains comptes rendus peut être limité aux 32.000 premiers caractères. Si vous souhaitez tout de même obtenir l'intégralité du texte, vous pouvez choisir le format csv qui n'est pas limité en taille."

  return (
    <CustomAlert severity="warning" style={{ marginBottom: 16 }}>
      {message}
    </CustomAlert>
  )
}

/**
 * Export table component that provides configuration options for individual tables.
 *
 * Features:
 * - Table selection with checkbox
 * - Column selection with multi-select
 * - FHIR resource filtering
 * - Row count display with validation
 * - Special pivot mode for questionnaire responses
 * - Excel format warnings for document tables
 *
 * @param {ExportTableProps} props - Component props
 * @returns {JSX.Element} The ExportTable component
 */
const ExportTable: React.FC<ExportTableProps> = ({
  exportTable,
  exportTableSettings,
  exportCohort,
  setError,
  addNewTableSetting,
  removeTableSetting,
  onChangeTableSettings,
  compatibilitiesTables,
  exportTypeFile,
  oneFile
}) => {
  const dispatch = useAppDispatch()
  const userId = useAppSelector((state) => state.me?.id)
  const { classes } = useStyles()
  const [filters, setFilters] = useState<any[]>([])
  const [count, setCount] = useState<number | null>(null)
  const [countLoading, setCountLoading] = useState<boolean>(false)
  const [countDetail, setCountDetail] = useState<(number | undefined)[]>([])
  const cohortId = exportCohort?.group_id
  const exportColumns = exportTable.columns || []
  const tableSetting = exportTableSettings
  const exportTableResourceType = getResourceType(exportTable.name)
  const tableLabel = getExportTableLabel(exportTable.name)
  const checkedTable = tableSetting?.isChecked ?? false
  const [checkedPivotMerge, setCheckedPivotMerge] = useState<boolean>(false)
  const appConfig = useContext(AppConfig)
  const limit = appConfig.features.export.exportLinesLimit
  const [isQuestionChoiceOpen, setIsQuestionChoiceOpen] = useState<boolean>(false)
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionLeaf[]>([])
  const [selectedQuestionnaireIds, setSelectedQuestionnaireIds] = useState<string[]>([])
  const [isExtended, setIsExtended] = useState<boolean>(false)
  const [defaultQuestionnaireIds, setDefaultQuestionnaireIds] = useState<string[]>([])

  const isCompatibleTable = (tableName: string) => {
    const table = compatibilitiesTables?.find((table) => table === tableName)
    return table
  }

  const onSelectedQuestionsChange = (questions: QuestionLeaf[], questionnaireId: string[]) => {
    setSelectedQuestions(questions)
    setSelectedQuestionnaireIds(questionnaireId)
  }

  const onDisableSelectedTable = () => {
    if (exportTable.name === 'person') return true
    if (count === 0) return true
    if (oneFile && !isCompatibleTable(exportTable.name)) return true
    return false
  }

  const handleOpen = () => {
    setIsQuestionChoiceOpen(true)
    setIsExtended(false)
  }
  const handleQuestionChoiceOpen = (isOpen: boolean) => {
    setIsQuestionChoiceOpen(!isOpen)
  }

  const handleDeleteSelectedQuestions = (newSelectedQuestions: QuestionLeaf[]) => {
    setSelectedQuestions(newSelectedQuestions)
  }

  const getFilterList = useCallback(async () => {
    try {
      const filtersResp = await getProviderFilters(userId, exportTableResourceType)

      setFilters(filtersResp)
    } catch (error) {
      console.error("Erreur lors de la récupération des filtres de l'utilisateur", error)
      setFilters([])
    }
  }, [exportTableResourceType, userId])

  const getFilterCount = useCallback(async () => {
    try {
      setCountLoading(true)
      const count = await fetchResourceCount2(cohortId ?? '', exportTableResourceType, tableSetting?.fhirFilter)
      setCount(count)
      setCountLoading(false)
    } catch (error) {
      setError(exportTable.name, Error.ERROR_FETCH)
      setCountLoading(false)
      console.error(error)
    }
  }, [cohortId, exportTableResourceType, tableSetting?.fhirFilter])

  const getQuestionnaireResponseCountDetails = useCallback(async () => {
    try {
      const countDetail = (await fetchQuestionnaireResponseCountDetails(cohortId ?? '')) ?? []
      setCountDetail(countDetail)
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de réponses aux questionnaires', error)
    }
  }, [cohortId])

  useEffect(() => {
    if (exportTableResourceType !== ResourceType.UNKNOWN) {
      getFilterList()
    }
  }, [getFilterList, exportTableResourceType])

  useEffect(() => {
    if (
      tableSetting?.isChecked === true &&
      count &&
      (exportTableResourceType === ResourceType.DOCUMENTS ? count > 5000 : count > limit)
    ) {
      setError(tableSetting?.tableName, Error.ERROR_TABLE_LIMIT)
    } else {
      setError(tableSetting?.tableName ?? '', Error.NO_ERROR)
    }
  }, [count, tableSetting?.isChecked])

  useEffect(() => {
    if (ResourceType.UNKNOWN !== exportTableResourceType && cohortId) {
      getFilterCount()
      getQuestionnaireResponseCountDetails()
    }
  }, [exportTableResourceType, getFilterCount, getQuestionnaireResponseCountDetails, cohortId])

  useEffect(() => {
    if (checkedPivotMerge) {
      onChangeTableSettings([{ tableName: exportTable.name, key: 'pivotMergeColumns', value: [] }])
    }
    if (checkedPivotMerge && defaultQuestionnaireIds.length > 0) {
      onChangeTableSettings([{ tableName: exportTable.name, key: 'pivotMergeIds', value: defaultQuestionnaireIds }])
    }
    if (!checkedPivotMerge) {
      onChangeTableSettings([
        { tableName: exportTable.name, key: 'pivotMergeColumns', value: undefined },
        { tableName: exportTable.name, key: 'pivotMergeIds', value: undefined }
      ])
    }
    if (checkedPivotMerge && selectedQuestions.length > 0) {
      onChangeTableSettings([
        { tableName: exportTable.name, key: 'pivotMergeColumns', value: selectedQuestions.map((q) => q.linkId) },
        { tableName: exportTable.name, key: 'pivotMergeIds', value: selectedQuestionnaireIds }
      ])
    }
  }, [
    exportTable.fhirResourceName === ResourceType.QUESTIONNAIRE_RESPONSE,
    checkedPivotMerge,
    selectedQuestions,
    defaultQuestionnaireIds
  ])

  useEffect(() => {
    if (oneFile && exportTable.name === ResourceType.QUESTIONNAIRE_RESPONSE && checkedTable === true) {
      dispatch(
        showDialog({
          isOpen: true,
          message:
            "Il n'est pas possible de réunir les tables en un seul fichier car l'un des formulaire est vide. Veuillez exporter les tables séparément. Si vous souhaitez tout de même exporter des tables en un seul fichier, veuillez choisir d'autres tables.",
          status: 'warning',
          onConfirm: () => {
            removeTableSetting(exportTable.name)
            setSelectedQuestions([])
            setCheckedPivotMerge(false)
            // oneFileSetter(false)
            dispatch(hideDialog())
          }
        })
      )
    }
  }, [exportTableResourceType === ResourceType.QUESTIONNAIRE_RESPONSE && checkedTable === true && oneFile])

  return (
    <Grid container className={classes.exportTableGrid} id={exportTable.name}>
      <Grid item container alignItems="center">
        <Grid item container alignItems="center" xs={6}>
          <Typography
            variant="subtitle2"
            className={tableSetting?.isChecked ? classes.selectedTable : classes.notSelectedTable}
          >
            {tableLabel} &nbsp;
          </Typography>
          <div>
            <Typography
              variant="subtitle2"
              className={tableSetting?.isChecked ? classes.selectedTable : classes.notSelectedTable}
              component="span"
            >
              {'['}
            </Typography>
            <Typography variant="h6" className={classes.tableLabel} component="span">
              {exportTable.name}
            </Typography>
            <Typography
              variant="subtitle2"
              className={tableSetting?.isChecked ? classes.selectedTable : classes.notSelectedTable}
              component="span"
            >
              {']'}
            </Typography>
          </div>
        </Grid>

        <Grid container item xs={4}>
          {exportTableResourceType !== ResourceType.UNKNOWN && (
            <>
              {countLoading ? (
                <CircularProgress size={30} />
              ) : (
                <Typography
                  variant="h3"
                  width={'50%'}
                  fontSize={12}
                  color={tableSetting?.isChecked ? '#153D8A' : '#888'}
                >
                  {`${count} ${
                    exportTableResourceType !== ResourceType.QUESTIONNAIRE_RESPONSE ? 'ligne' : 'Formulaire'
                  }${count && count > 1 ? 's' : ''}`}
                </Typography>
              )}
            </>
          )}
        </Grid>

        <Grid container item xs={2} justifyContent={'end'}>
          <Checkbox
            id={tableSetting?.tableName + '_selectTable'}
            disabled={onDisableSelectedTable()}
            color="secondary"
            checked={checkedTable}
            onChange={(_, val) => {
              if (val) {
                addNewTableSetting({
                  tableName: exportTable.name,
                  isChecked: true,
                  columns: tableSetting?.columns ?? null,
                  fhirFilter: tableSetting?.fhirFilter ?? null,
                  respectTableRelationships: true
                })
              } else {
                removeTableSetting(exportTable.name)
                setSelectedQuestions([])
                setCheckedPivotMerge(false)
              }
            }}
          />
        </Grid>
      </Grid>

      {exportTypeFile === 'xlsx' && exportTableResourceType === ResourceType.DOCUMENTS && (
        <Grid>
          <AlertLimitXlsx />
        </Grid>
      )}

      {exportTable.name === ResourceType.QUESTIONNAIRE_RESPONSE && (
        <Grid container alignItems={'center'}>
          <Switch
            // style={{ padding: '0, 0, 0, 0' }}
            color="secondary"
            disabled={!checkedTable}
            checked={checkedPivotMerge}
            onClick={(e) => {
              e.stopPropagation()
              setCheckedPivotMerge(!checkedPivotMerge)
            }}
          />
          <Typography color={tableSetting?.isChecked ? 'rgba(0, 0, 0, 0.8)' : '#888'} fontSize={13} fontWeight={600}>
            Positionner les questions en colonnes "Pivot" (désactive la sélection des colonnes à exporter)
          </Typography>
        </Grid>
      )}

      <Grid container justifyContent={'space-between'}>
        {!checkedPivotMerge && (
          <Grid container xs={6} alignItems={'center'} id={tableSetting?.tableName + 'columnsFilters'}>
            <Typography marginRight={'5px'} className={classes.textBody2}>
              Sélectionner les colonnes à exporter :
            </Typography>
            <Autocomplete
              multiple
              value={tableSetting?.columns || []}
              className={classes.autocomplete}
              size="small"
              limitTags={4}
              sx={{ width: '500px' }}
              disabled={checkedTable === false || checkedPivotMerge}
              disableCloseOnSelect
              options={['Tout sélectionner', ...exportColumns]}
              onChange={(event, newValue) => {
                if (newValue.includes('Tout sélectionner')) {
                  if (tableSetting?.columns?.length === exportColumns.length) {
                    onChangeTableSettings([{ tableName: exportTable.name, key: 'columns', value: null }])
                  } else {
                    onChangeTableSettings([{ tableName: exportTable.name, key: 'columns', value: exportColumns }])
                  }
                } else {
                  onChangeTableSettings([
                    {
                      tableName: exportTable.name,
                      key: 'columns',
                      value: newValue.filter((e) => e !== 'Tout sélectionner')
                    }
                  ])
                }
              }}
              noOptionsText="Aucune colonne disponible"
              getOptionLabel={(option) => {
                return `${option}`
              }}
              renderOption={(props, option, { selected }) => {
                const { key, ...optionProps } = props
                const isChecked =
                  option === 'Tout sélectionner'
                    ? tableSetting?.columns?.length === exportColumns.length
                    : tableSetting?.columns?.includes(option)
                const isIndeterminate =
                  option === 'Tout sélectionner' &&
                  (tableSetting?.columns?.length ?? 0) > 0 &&
                  (tableSetting?.columns?.length ?? 0) < exportColumns.length
                return (
                  <li key={key} {...optionProps}>
                    <Checkbox
                      style={{ marginRight: 8 }}
                      checked={isChecked || selected}
                      indeterminate={isIndeterminate}
                    />
                    <ListItemText primary={option} />
                  </li>
                )
              }}
              renderInput={(params) => {
                return <TextField {...params} label="Sélectionnez une colonne" />
              }}
            />
          </Grid>
        )}

        <Grid container xs={6} alignItems="center" id={tableSetting?.tableName + 'ResourceFilters'}>
          {exportTableResourceType !== ResourceType.UNKNOWN &&
            exportTableResourceType !== ResourceType.QUESTIONNAIRE_RESPONSE && (
              <>
                <Typography marginLeft={'75px'} marginRight={'5px'} className={classes.textBody2}>
                  Filtrer cette table :
                </Typography>
                <Autocomplete
                  className={classes.autocomplete}
                  size="small"
                  disabled={checkedTable === false}
                  options={filters}
                  noOptionsText="Aucun filtre disponible"
                  getOptionLabel={(option) => {
                    return `${option.name}`
                  }}
                  renderInput={(params) => <TextField {...params} label="Sélectionnez un filtre" />}
                  value={tableSetting?.fhirFilter}
                  onChange={(_, value) => {
                    onChangeTableSettings([{ tableName: exportTable.name, key: 'fhirFilter', value }])
                  }}
                />
              </>
            )}
        </Grid>
      </Grid>

      {exportTable.name === ResourceType.QUESTIONNAIRE_RESPONSE && checkedPivotMerge && (
        <Grid container alignItems={'center'} id={tableSetting?.tableName + 'questionChoice'}>
          <QuestionForm
            open={isQuestionChoiceOpen}
            onClose={() => handleQuestionChoiceOpen(isQuestionChoiceOpen)}
            selectedQuestions={selectedQuestions}
            onDefaultQuestionnaireIds={setDefaultQuestionnaireIds}
            onConfirm={onSelectedQuestionsChange}
          />

          <Grid item>
            <Typography marginRight={'5px'} className={classes.textBody2}>
              {selectedQuestions.length > 0 ? 'Modifier' : 'Sélectionner'} les questions à exporter :
            </Typography>
          </Grid>

          <Grid
            container
            item
            xs={selectedQuestions.length > 0 ? 12 : 3.59}
            alignItems={selectedQuestions.length ? 'flex-start' : 'center'}
            border="1px solid rgba(0, 0, 0, 0.25)"
            borderRadius="4px"
            padding="6px 1px 6px 8px"
            className="ValueSetField"
            style={{
              maxHeight: 200,
              overflowX: 'hidden',
              overflowY: 'auto'
            }}
          >
            <Grid
              container
              alignItems="center"
              item
              xs={selectedQuestions.length > 0 ? 11.4 : 10}
              tabIndex={0}
              style={{ cursor: 'pointer' }}
              onClick={handleOpen}
            >
              <div style={{ display: isExtended ? 'block' : 'flex', alignItems: 'center', overflow: 'hidden' }}>
                {selectedQuestions.map((l) => (
                  <Chip
                    key={l.linkId}
                    label={l.text ?? l.linkId}
                    onDelete={() => {
                      const newSelectedQuestions = selectedQuestions.filter((q) => q.linkId !== l.linkId)
                      handleDeleteSelectedQuestions(newSelectedQuestions)
                      setSelectedQuestions(newSelectedQuestions)
                    }}
                    style={{ backgroundColor: '#f7f7f7', margin: '0 5px 5px 0' }}
                  />
                ))}
              </div>
            </Grid>
            <Grid item xs={selectedQuestions.length > 0 ? 0.6 : 2} container justifyContent="flex-end">
              {isExtended && selectedQuestions.length > 0 && (
                <IconButton size="small" sx={{ color: '#5BC5F2' }} onClick={() => setIsExtended(false)}>
                  <CloseIcon />
                </IconButton>
              )}
              {!isExtended && selectedQuestions.length > 0 && (
                <IconButton size="small" sx={{ color: '#5BC5F2' }} onClick={() => setIsExtended(true)}>
                  <MoreHorizIcon />
                </IconButton>
              )}
              <IconButton sx={{ color: '#5BC5F2' }} size="small" onClick={handleOpen}>
                <SearchOutlined />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      )}
      {count !== null &&
        (exportTableResourceType === ResourceType.DOCUMENTS ? count > 5000 : count > limit) &&
        tableSetting?.isChecked && (
          <Grid marginTop={'1em'}>
            <Typography color={'red'} fontWeight={'bold'} fontSize={12}>
              La table sélectionnée dépasse la limite de{' '}
              {exportTableResourceType === ResourceType.DOCUMENTS ? 5000 : limit} lignes autorisées. Veuillez affiner
              votre sélection à l'aide de filtres ou désélectionner la table.
            </Typography>
          </Grid>
        )}
    </Grid>
  )
}

export default ExportTable
