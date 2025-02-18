import React, { useCallback, useContext, useEffect, useState } from 'react'

import {
  Grid,
  Typography,
  TextField,
  Checkbox,
  Autocomplete,
  CircularProgress,
  Alert,
  ListItemText
} from '@mui/material'

import useStyles from '../../styles'
import { getResourceType, getExportTableLabel, fetchResourceCount2 } from 'components/Dashboard/ExportModal/exportUtils'
import { ResourceType } from 'types/requestCriterias'
import { getProviderFilters } from 'services/aphp/serviceFilters'
import { useAppSelector } from 'state'
import { AppConfig } from 'config'

import { Cohort } from 'types'
import { TableInfo, TableSetting } from 'types/export'

import { Error } from '../ExportForm'

type ExportTableProps = {
  exportTable: TableInfo
  exportTableSettings: TableSetting[]
  exportCohort: Cohort | null
  setError: (tableName: string, errorValue: Error) => void
  addNewTableSetting: (newTableSetting: TableSetting) => void
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
  const tableSetting = exportTableSettings.filter((e) => e.tableName === exportTable.name)[0]
  const exportTableResourceType = getResourceType(exportTable.name)
  const tableLabel = getExportTableLabel(exportTable.name)
  const [checkedTable, setCheckedTable] = useState<boolean>(tableSetting?.isChecked || false)
  const [checkedPivotMerge, setCheckedPivotMerge] = useState<boolean>(tableSetting?.isChecked || false)
  const appConfig = useContext(AppConfig)
  const limit = appConfig.features.export.exportLinesLimit

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
      console.error(error)
    }
  }, [cohortId, exportTableResourceType, tableSetting?.fhirFilter])

  useEffect(() => {
    if (tableSetting?.isChecked !== null) {
      setCheckedTable(tableSetting?.isChecked)
    }
    if (tableSetting?.pivotMerge !== null) {
      setCheckedPivotMerge(tableSetting?.pivotMerge)
    }
    if (tableSetting?.pivotMerge) {
      onChangeTableSettings(exportTable.name, 'columns', null)
    }
  }, [tableSetting?.isChecked, tableSetting?.pivotMerge])

  useEffect(() => {
    if (exportTableResourceType !== ResourceType.UNKNOWN) {
      getFilterList()
    }
  }, [getFilterList, exportTableResourceType])

  useEffect(() => {
    if (tableSetting === undefined) {
      const newTableSetting = {
        tableName: exportTable.name,
        isChecked: false,
        columns: null,
        fhirFilter: null,
        respectTableRelationships: true,
        pivotMerge: false
      }
      addNewTableSetting(newTableSetting)
    }
  })

  useEffect(() => {
    if (
      tableSetting?.isChecked === true &&
      count &&
      (exportTableResourceType === ResourceType.DOCUMENTS ? count > 5000 : count > limit)
    ) {
      setError(tableSetting?.tableName, Error.ERROR_TABLE_LIMIT)
    } else {
      setError(tableSetting?.tableName, Error.NO_ERROR)
    }
  }, [count, tableSetting?.isChecked])

  const isCompatibleTable = (tableName: string) => {
    const table = compatibilitiesTables?.find((table) => table === tableName)
    return table
  }

  useEffect(() => {
    if (ResourceType.UNKNOWN !== exportTableResourceType) {
      getFilterCount()
    }
  }, [exportTableResourceType, getFilterCount])

  return (
    <Grid container className={classes.exportTableGrid}>
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
            disabled={
              oneFile
                ? !isCompatibleTable(exportTable.name) || exportTable.name === 'person'
                : exportTable.name === 'person'
            }
            color="secondary"
            checked={checkedTable}
            onClick={(e) => {
              e.stopPropagation()
              onChangeTableSettings(
                exportTable.name,
                'isChecked',
                tableSetting?.isChecked !== undefined ? !tableSetting.isChecked : true
              )
            }}
          />
        </Grid>
      </Grid>
      {exportTypeFile === 'xlsx' && exportTableResourceType === ResourceType.DOCUMENTS && (
        <Grid>
          <AlertLimitXlsx />
        </Grid>
      )}
      <Grid container justifyContent={'space-between'}>
        {checkedPivotMerge === false && (
          <Grid container xs={6} alignItems={'center'}>
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
              disabled={tableSetting?.isChecked === false}
              disableCloseOnSelect
              options={['Tous selectionner', ...exportColumns]}
              onChange={(event, newValue) => {
                if (newValue.includes('Tous selectionner')) {
                  if (tableSetting?.columns?.length === exportColumns.length) {
                    onChangeTableSettings(exportTable.name, 'columns', null)
                  } else {
                    onChangeTableSettings(exportTable.name, 'columns', exportColumns)
                  }
                } else {
                  onChangeTableSettings(
                    exportTable.name,
                    'columns',
                    newValue.filter((e) => e !== 'Tous selectionner')
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
                  option === 'Tous selectionner'
                    ? tableSetting?.columns?.length === exportColumns.length
                    : tableSetting?.columns?.includes(option)
                const isIndeterminate =
                  option === 'Tous selectionner' &&
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
        <Grid container xs={6} alignItems="center">
          {exportTableResourceType !== ResourceType.UNKNOWN && (
            <>
              <Typography marginLeft={'75px'} marginRight={'5px'} className={classes.textBody2}>
                Filtrer cette table :
              </Typography>
              <Autocomplete
                className={classes.autocomplete}
                size="small"
                disabled={tableSetting?.isChecked === false}
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
      {exportTable.name === ResourceType.QUESTIONNAIRE_RESPONSE && (
        <Grid container alignItems={'center'}>
          <Checkbox
            style={{ padding: '0, 0, 0 ,0' }}
            color="secondary"
            disabled={!checkedTable}
            checked={tableSetting?.pivotMerge || false}
            onClick={(e) => {
              e.stopPropagation()
              onChangeTableSettings(exportTable.name, 'pivotMerge', !tableSetting.pivotMerge)
            }}
          />
          <Typography color={tableSetting?.isChecked ? 'rgba(0, 0, 0, 0.8)' : '#888'} fontSize={13} fontWeight={600}>
            Positionner les questions en colonnes "Pivot" (desactive la selection des colonnes a exporter)
          </Typography>
        </Grid>
      )}
      {count !== null && (exportTableResourceType === ResourceType.DOCUMENTS ? count > 5000 : count > limit) && (
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
