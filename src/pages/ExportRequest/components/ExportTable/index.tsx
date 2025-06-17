/* eslint-disable max-statements */
import React, { useCallback, useContext, useEffect, useState } from 'react'

import {
  Grid,
  Typography,
  TextField,
  Checkbox,
  Autocomplete,
  CircularProgress,
  Alert,
  ListItemText,
  IconButton,
  Switch
} from '@mui/material'

import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import SearchOutlined from '@mui/icons-material/SearchOutlined'

import Chip from 'components/ui/Chip'
import useStyles from '../../styles'
import { getResourceType, getExportTableLabel, fetchResourceCount2 } from 'pages/ExportRequest/components/exportUtils'
import { ResourceType } from 'types/requestCriterias'
import { getProviderFilters } from 'services/aphp/serviceFilters'
import { useAppSelector } from 'state'
import { AppConfig } from 'config'

import { Cohort } from 'types'
import { TableInfo, TableSetting } from 'types/export'

import { Error } from '../ExportForm'
import QuestionForm, { QuestionLeaf } from 'pages/ExportRequest/components/QuestionChoice'

type ExportTableProps = {
  exportTable: TableInfo
  exportTableSettings: TableSetting | undefined
  exportCohort: Cohort | null
  setError: (tableName: string, errorValue: Error) => void
  addNewTableSetting: (newTableSetting: TableSetting) => void
  removeTableSetting: (tableName: string) => void
  onChangeTableSettings: (tableName: string, key: string, value: any) => void
  compatibilitiesTables: string[] | null
  exportTypeFile: 'xlsx' | 'csv'
  oneFile: boolean
}

const AlertLimitXlsx: React.FC = () => {
  const message =
    "Attention, le format excel étant limité à 32.000 caractères par cellule, le contenu de certains comptes rendus peut être limité aux 32.000 premiers caractères. Si vous souhaitez tout de même obtenir l'intégralité du texte, vous pouvez choisir le format csv qui n'est pas limité en taille."

  return (
    <Alert severity="warning" style={{ marginBottom: 16 }}>
      {message}
    </Alert>
  )
}

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
  const userId = useAppSelector((state) => state.me?.id)
  const { classes } = useStyles()
  const [filters, setFilters] = useState<any[]>([])
  const [count, setCount] = useState<number | null>(null)
  const [countLoading, setCountLoading] = useState<boolean>(false)
  const cohortId = exportCohort?.group_id
  const exportColumns = exportTable.columns || []
  const tableSetting = exportTableSettings
  const exportTableResourceType = getResourceType(exportTable.name)
  const tableLabel = getExportTableLabel(exportTable.name)
  const checkedTable = tableSetting?.isChecked ?? false
  const [checkedPivotMerge, setCheckedPivotMerge] = useState<boolean>(false)
  const appConfig = useContext(AppConfig)
  const limit = appConfig.features.export.exportLinesLimit
  const [isQuestionChoiceOpen, setIsQuestionChoiceOpen] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionLeaf[]>([])
  const [isExtended, setIsExtended] = useState(false)

  const isCompatibleTable = (tableName: string) => {
    const table = compatibilitiesTables?.find((table) => table === tableName)
    return table
  }

  const handleOpen = () => {
    setIsQuestionChoiceOpen(true)
    setIsExtended(false)
  }

  const onTest = (arg: any[]) => {
    setSelectedQuestions(arg)
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
    if (ResourceType.UNKNOWN !== exportTableResourceType) {
      getFilterCount()
    }
  }, [exportTableResourceType, getFilterCount])

  const handleQuestionChoiceOpen = (isOpen: boolean) => {
    setIsQuestionChoiceOpen(!isOpen)
  }

  const handleDeleteSelectedQuestions = (newSelectedQuestions: any[]) => {
    setSelectedQuestions(newSelectedQuestions)
  }

  useEffect(() => {
    if (checkedPivotMerge) {
      onChangeTableSettings(exportTable.name, 'pivotMergeColumns', [])
    }
    if (!checkedPivotMerge) {
      onChangeTableSettings(exportTable.name, 'pivotMergeColumns', undefined)
    }
    if (checkedPivotMerge && selectedQuestions.length > 0) {
      onChangeTableSettings(
        exportTable.name,
        'pivotMergeColumns',
        selectedQuestions.map((q) => q.linkId)
      )
    }
  }, [checkedPivotMerge, selectedQuestions])

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
                  {count} ligne{count && count > 1 ? 's' : ''}
                </Typography>
              )}
            </>
          )}
        </Grid>

        <Grid container item xs={2} justifyContent={'end'}>
          <Checkbox
            id={tableSetting?.tableName + '_selectTable'}
            disabled={
              oneFile
                ? !isCompatibleTable(exportTable.name) || exportTable.name === 'person'
                : exportTable.name === 'person'
            }
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
                    onChangeTableSettings(exportTable.name, 'columns', null)
                  } else {
                    onChangeTableSettings(exportTable.name, 'columns', exportColumns)
                  }
                } else {
                  onChangeTableSettings(
                    exportTable.name,
                    'columns',
                    newValue.filter((e) => e !== 'Tout sélectionner')
                  )
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
          {exportTableResourceType !== ResourceType.UNKNOWN && (
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
                  onChangeTableSettings(exportTable.name, 'fhirFilter', value)
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
            onConfirm={onTest}
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
