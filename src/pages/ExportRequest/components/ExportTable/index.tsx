import React, { useCallback, useContext, useEffect, useState } from 'react'

import { Grid, Typography, TextField, Checkbox, Autocomplete, CircularProgress, Alert } from '@mui/material'

import useStyles from '../../styles'
import { getResourceType, getExportTableLabel, fetchResourceCount2 } from 'components/Dashboard/ExportModal/exportUtils'
import { ResourceType } from 'types/requestCriterias'
import { getProviderFilters } from 'services/aphp/serviceFilters'
import { useAppSelector } from 'state'
import { AppConfig } from 'config'

import { Cohort } from 'types'
import { TableInfo, TableSetting } from 'types/export'

type ExportTableProps = {
  exportTable: TableInfo
  exportTableSettings: TableSetting[]
  exportCohort: Cohort | null
  setError: (arg: any) => void
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
  const [countError, setCountError] = useState<boolean>(false)
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
      setCountError(true)
      setError(error)
    }
  }, [cohortId, exportTableResourceType, setError, tableSetting?.fhirFilter])

  useEffect(() => {
    if (tableSetting?.isChecked !== null) {
      setCheckedTable(tableSetting?.isChecked)
    }
  }, [tableSetting?.isChecked])

  useEffect(() => {
    onChangeTableSettings(exportTable.name, 'pivotMerge', checkedPivotMerge)
  }, [checkedPivotMerge])

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
        pivotMerge: null
      }
      addNewTableSetting(newTableSetting)
    }
  })

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
    <Grid container>
      <Grid item container alignItems="center">
        <Grid item container alignItems="center" xs={6}>
          <Typography
            variant="subtitle2"
            // className={selectExportTable ? classes.selectedTable : classes.notSelectedTable}
          >
            {tableLabel} &nbsp;
          </Typography>
          <div>
            <Typography
              variant="subtitle2"
              // className={selectExportTable ? classes.selectedTable : classes.notSelectedTable}
              component="span"
            >
              {'['}
            </Typography>
            <Typography variant="h6" className={classes.tableLabel} component="span">
              {exportTable.name}
            </Typography>
            <Typography
              variant="subtitle2"
              // className={selectExportTable ? classes.selectedTable : classes.notSelectedTable}
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
                <CircularProgress />
              ) : (
                <Typography
                  variant="h3"
                  width={'50%'}
                  fontSize={12}
                  textAlign={'center'}
                  color={/*selectExportTable ?*/ '#153D8A' /* : '#888'*/}
                >
                  {count} ligne(s)
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
              setCheckedPivotMerge(!checkedPivotMerge)
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
        <Grid container xs={6} alignItems={'center'}>
          <Typography marginRight={'5px'} className={classes.textBody2}>
            Sélectionner les colonnes à exporter :
          </Typography>
          <Autocomplete
            multiple
            className={classes.autocomplete}
            size="small"
            limitTags={4}
            sx={{ width: '500px' }}
            disabled={tableSetting?.isChecked === false}
            disableCloseOnSelect
            options={exportColumns}
            noOptionsText="Aucune colonne disponible"
            getOptionLabel={(option) => {
              return `${option}`
            }}
            renderOption={(props, option, { selected }) => {
              const { key, ...optionProps } = props
              return (
                <li key={key} {...optionProps}>
                  <Checkbox style={{ marginRight: 8 }} checked={selected} />
                  {option}
                </li>
              )
            }}
            renderInput={(params) => {
              return <TextField {...params} label="Sélectionnez une colonne" />
            }}
            value={tableSetting?.columns || []}
            onChange={(_, value) => onChangeTableSettings(exportTable.name, 'columns', value)}
          />
        </Grid>
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
            disabled={!checkedTable}
            checked={checkedPivotMerge}
            onClick={(e) => {
              e.stopPropagation()
              setCheckedPivotMerge(!checkedPivotMerge)
            }}
          />
          <Typography>Positionner les questions en colonnes (Pivot)</Typography>
        </Grid>
      )}
      {count !== null && (exportTableResourceType === ResourceType.DOCUMENTS ? count > 5000 : count > limit) && (
        <Grid>
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
