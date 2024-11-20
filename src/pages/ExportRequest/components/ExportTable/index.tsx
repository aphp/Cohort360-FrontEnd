import React, { useEffect, useState } from 'react'

import { Grid, Typography, TextField, Checkbox, Autocomplete, CircularProgress } from '@mui/material'

import { fakeFilterList, fakeExportTable } from '../../fakedata/fakeExportTable'
// import { ExportTableSettings } from '../ExportForm/index'

import useStyles from '../../styles'
import { getResourceType, getExportTableLabel, fetchResourceCount2 } from 'components/Dashboard/ExportModal/exportUtils'

type ExportTableProps = {
  exportTable: any
  exportTableSettings: any
  exportCohort: any
  setError: (arg: any) => void
  addNewTableSetting: (newTableSetting: any) => void
  onChangeTableSettings: (tableName: string, key: string, value: any) => void
}

const ExportTable: React.FC<ExportTableProps> = ({
  exportTable,
  exportTableSettings,
  exportCohort,
  setError,
  addNewTableSetting,
  onChangeTableSettings
}) => {
  const { classes } = useStyles()
  const [filters, setFilters] = useState<any[]>(fakeFilterList)
  const [count, setCount] = useState<number | null>(1300)
  const [countLoading, setCountLoading] = useState<boolean>(false)
  const [countError, setCountError] = useState<boolean>(false)
  const cohortId = exportCohort?.group_id
  const exportColumns = fakeExportTable.filter((item) => item.name === exportTable.name)[0].columns
  const tableSetting = exportTableSettings.filter((e: any) => e.tableName === exportTable.name)[0]
  const exportTableResourceType = getResourceType(exportTable.name)
  const tableLabel = getExportTableLabel(exportTable.name)

  const getFilterCount = async () => {
    console.log("manelle c'est moi qui rend plusieurs fois")
    try {
      setCountLoading(true)
      const count = await fetchResourceCount2(cohortId, exportTableResourceType)
      setCount(count)
      setCountLoading(false)
    } catch (error) {
      setCountError(true)
      setError(error)
    }
  }

  useEffect(() => {
    if (cohortId !== undefined) {
      getFilterCount()
    }
    if (tableSetting === undefined) {
      const newTableSetting = { tableName: exportTable.name, isChecked: false, columns: null, fhirFilter: null }
      addNewTableSetting(newTableSetting)
    }
  })

  return (
    <Grid container>
      <Grid item container alignItems={'center'}>
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
        </Grid>
        <Grid container item xs={2} justifyContent={'end'}>
          <Checkbox
            // disabled={isChecked ? compatibilities(exportTable) || label === 'person' : label === 'person'}
            color="secondary"
            checked={tableSetting?.isChecked}
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
      <Grid container justifyContent={'space-between'}>
        <Grid container xs={6}>
          <Typography marginTop={'12px'} className={classes.textBody2}>
            Filtrer cette table avec un filtre :
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
        </Grid>
        <Grid container xs={6}>
          <Typography marginTop={'12px'} className={classes.textBody2}>
            Selectionner les colonnes a exporter :
          </Typography>
          <Autocomplete
            multiple
            className={classes.autocomplete}
            size="small"
            disabled={tableSetting?.isChecked === false}
            options={exportColumns}
            noOptionsText="Aucune colonne disponible"
            getOptionLabel={(option) => {
              return `${option}`
            }}
            renderInput={(params) => {
              return <TextField {...params} label="Sélectionnez une colonne" />
            }}
            value={tableSetting?.columns || []}
            onChange={(_, value) => onChangeTableSettings(exportTable.name, 'columns', value)}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ExportTable
