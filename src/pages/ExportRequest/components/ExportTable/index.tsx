import React, { useState } from 'react'

import { Grid, Typography, TextField, Checkbox, Chip, Autocomplete } from '@mui/material'

import { fakeFilterList } from '../../fakedata/fakeExportTable'

import useStyles from '../../styles'

type ExportTableProps = {
  exportTable: any
  exportTableSettings: any
  setError: any
  setExportTableSettings: (key: string, value: any) => void
}

const ExportTable: React.FC<ExportTableProps> = ({ exportTable, exportTableSettings, setExportTableSettings }) => {
  const { classes } = useStyles()
  const [filters, setFilters] = useState<any[]>(fakeFilterList)
  const exportColumns = exportTable.columns

  console.log('manelle exportTable', exportTable)
  console.log('manelle exportTableSettings', exportTableSettings)

  return (
    <Grid container>
      <Grid item container alignItems={'center'}>
        <Grid item container alignItems="center" xs={5}>
          <Typography
            variant="subtitle2"
            // className={selectExportTable ? classes.selectedTable : classes.notSelectedTable}
          >
            {exportTable.name} &nbsp;
          </Typography>
          <div>
            <Typography
              variant="subtitle2"
              // className={selectExportTable ? classes.selectedTable : classes.notSelectedTable}
              component="span"
            >
              {'['}
            </Typography>
            <Typography variant="h6" className={classes.tableCode} component="span">
              {exportTable.label}
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
        <Typography
          variant="h3"
          width={'50%'}
          fontSize={12}
          textAlign={'center'}
          color={/*selectExportTable ?*/ '#153D8A' /* : '#888'*/}
        >
          {/* {!resourcesWithNoFilters.includes(resourceType) &&
          (_countLoading ? <CircularProgress size={15} /> : `${count} lignes`)} */}
          1300 lignes
        </Typography>
        <Checkbox
          // disabled={isChecked ? compatibilities(exportTable) || label === 'person' : label === 'person'}
          color="secondary"
          // checked={selectExportTable}
          className={classes.selectExportTableCheckbox}
          onClick={(e) => {
            // setSelectExportTable(!selectExportTable)
            // e.stopPropagation()
            // handleChangeTables(exportTable)
          }}
        />
      </Grid>
      <Grid container justifyContent={'space-between'}>
        <Grid xs={2}>
          <Typography marginTop={'12px'} className={classes.textBody2}>
            Selectionner les colonnes a exporter :
          </Typography>
          <Typography marginTop={'12px'} className={classes.textBody2}>
            Filtrer cette table avec un filtre :
          </Typography>
        </Grid>
        <Grid xs={3}>
          <Autocomplete
            className={classes.autocomplete}
            size="small"
            // disabled={meState?.maintenance?.active || !exportTable.checked}
            options={exportColumns}
            noOptionsText="Aucune colonne disponible"
            getOptionLabel={(option) => {
              console.log('manelle option colonne', option)
              return `Colonne: ${option}`
            }}
            // renderOption={(props, option) => <li {...props}>{option.name}</li>}
            renderInput={(params) => {
              console.log('manelle params', params)
              return <TextField {...params} label="Sélectionnez une colonne" />
            }}
            // value={selectedExportColumns.map((e) => e.name)}
            // onChange={(_, value) => setSelectedExportColumns([...selectedExportColumns, value])}
          />
          <Autocomplete
            className={classes.autocomplete}
            size="small"
            // disabled={meState?.maintenance?.active || !exportTable.checked}
            options={filters}
            noOptionsText="Aucun filtre disponible"
            getOptionLabel={(option) => {
              console.log('manelle option filtre', option)
              return `Filtre: ${option.name}`
            }}
            renderOption={(props, option) => <li {...props}>{option.name}</li>}
            renderInput={(params) => <TextField {...params} label="Sélectionnez un filtre" />}
            // value={selectedFhirFilter}
            // onChange={(_, value) => setSelectedFhirFilter(value)}
          />
        </Grid>
        <Grid xs={7} container justifyContent={'end'}>
          <p>Le resultat des colonnes</p>
          {/* {selectedExportColumns.length > 0 && (
            <Grid>
              {selectedExportColumns.map((selectedExportColumn, index) => (
                <Chip
                  key={index + selectedExportColumn}
                  label={selectedExportColumn.name}
                  onDelete={() =>
                    setSelectedExportColumns([
                      ...selectedExportColumns,
                      selectedExportColumns.filter((e) => e.name !== selectedExportColumn.name)
                    ])
                  }
                />
              ))}
            </Grid>
          )} */}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ExportTable
