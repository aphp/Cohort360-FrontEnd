import React, { useEffect, useState } from 'react'
import moment from 'moment'

import {
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  InputBase,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs,
  Typography
} from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'

import ClearIcon from '@material-ui/icons/Clear'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import PMSIFilters from 'components/Filters/PMSIFilters/PMSIFilters'

import { capitalizeFirstLetter } from 'utils/capitalize'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchPmsi } from 'state/patient'

import useStyles from './styles'

type PatientPMSITypes = {
  groupId?: string
}
const PatientPMSI: React.FC<PatientPMSITypes> = ({ groupId }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))

  const [selectedTab, selectTab] = useState<'diagnostic' | 'ghm' | 'ccam'>('diagnostic')

  const pmsiPatient = patient?.pmsi ?? {}
  const currrentPmsi = pmsiPatient[selectedTab] ?? {
    loading: false,
    count: 0,
    total: 0,
    list: []
  }

  const loading = currrentPmsi.loading ?? false
  const deidentifiedBoolean = patient?.deidentified ?? false
  const totalPmsi = currrentPmsi.count ?? 0
  const totalAllPmsi = currrentPmsi.total ?? 0

  const [patientPmsiList, setPatientPmsiList] = useState<any[]>([])

  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState<{
    searchInput: string
    nda: string
    code: string
    selectedDiagnosticTypes: any[]
    startDate: string | null
    endDate: string | null
  }>({
    searchInput: '',
    nda: '',
    code: '',
    selectedDiagnosticTypes: [],
    startDate: null,
    endDate: null
  })

  const [sortBy, setSortBy] = useState('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const [open, setOpen] = useState(false)

  const documentLines = 20 // Number of desired lines in the document array

  const _fetchPMSI = async (page: number) => {
    const selectedDiagnosticTypesCodes = filters.selectedDiagnosticTypes.map((diagnosticType) => diagnosticType.id)
    dispatch<any>(
      fetchPmsi({
        selectedTab,
        groupId,
        options: {
          page,
          sort: {
            by: sortBy,
            direction: sortDirection
          },
          filters: {
            ...filters,
            diagnosticTypes: selectedDiagnosticTypesCodes
          }
        }
      })
    )
  }

  const handleSort = (property: any) => (event: React.MouseEvent<unknown> /*eslint-disable-line*/) => {
    const isAsc: boolean = sortBy === property && sortDirection === 'asc'
    const newDirection = isAsc ? 'desc' : 'asc'

    setSortDirection(newDirection)
    setSortBy(property)
  }

  const handleChangePage = (event?: React.ChangeEvent<unknown>, value?: number) => {
    setPage(value ? value : 1)
    _fetchPMSI(value ? value : 1)
  }

  const onChangeOptions = (key: string, value: any) => {
    setFilters((prevState) => ({
      ...prevState,
      [key]: value
    }))
  }

  const handleDeleteChip = (filterName: string, value?: string) => {
    switch (filterName) {
      case 'nda':
        value &&
          onChangeOptions(
            filterName,
            filters.nda
              .split(',')
              .filter((item) => item !== value)
              .join()
          )
        break
      case 'code':
        value &&
          onChangeOptions(
            filterName,
            filters.code
              .split(',')
              .filter((item) => item !== value)
              .join()
          )
        break
      case 'startDate':
        onChangeOptions(filterName, null)
        break
      case 'endDate':
        onChangeOptions(filterName, null)
        break
      case 'selectedDiagnosticTypes':
        value &&
          onChangeOptions(
            filterName,
            filters.selectedDiagnosticTypes.filter((item) => item !== value)
          )
        break
    }
  }

  const onSearchPMSI = async () => {
    handleChangePage()
  }

  const onKeyDown = async (e: { keyCode: number; preventDefault: () => void }) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchPMSI()
    }
  }

  const handleClearInput = () => {
    onChangeOptions('searchInput', '')
    handleChangePage()
  }

  useEffect(() => {
    handleChangePage()
  }, [
    filters.nda,
    filters.code,
    filters.startDate,
    filters.endDate,
    filters.selectedDiagnosticTypes,
    sortBy,
    sortDirection
  ]) // eslint-disable-line

  useEffect(() => {
    setPage(1)
    // Clear filter state
    setFilters({
      searchInput: '',
      nda: '',
      code: '',
      selectedDiagnosticTypes: [],
      startDate: null,
      endDate: null
    })
    setSortBy('date')
    setSortDirection('desc')
  }, [selectedTab]) // eslint-disable-line

  useEffect(() => {
    const pmsiPatient = patient?.pmsi ?? {}
    const currrentPmsi = pmsiPatient[selectedTab] ?? {
      loading: false,
      count: 0,
      total: 0,
      list: []
    }
    setPatientPmsiList(currrentPmsi.list)
  }, [currrentPmsi, currrentPmsi?.list]) // eslint-disable-line

  return (
    <Grid container item xs={11} justifyContent="flex-end" className={classes.documentTable}>
      <Grid item container justifyContent="space-between" alignItems="center" className={classes.filterAndSort}>
        <Tabs
          classes={{
            root: classes.root,
            indicator: classes.indicator
          }}
          value={selectedTab}
          onChange={(event, value) => selectTab(value)}
        >
          <Tab
            classes={{ selected: classes.selected }}
            className={classes.tabTitle}
            label="Diagnostics CIM10"
            value="diagnostic"
          />
          <Tab classes={{ selected: classes.selected }} className={classes.tabTitle} label="Actes CCAM" value="ccam" />
          <Tab classes={{ selected: classes.selected }} className={classes.tabTitle} label="GHM" value="ghm" />
        </Tabs>

        <Typography variant="button">
          {`${totalPmsi || 0} / ${totalAllPmsi} ${
            selectedTab !== 'diagnostic' ? (selectedTab !== 'ccam' ? 'ghm' : 'acte(s)') : 'diagnostic(s)'
          }`}
        </Typography>

        <div className={classes.documentButtons}>
          <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
            <InputBase
              placeholder="Rechercher"
              className={classes.input}
              value={filters.searchInput}
              onChange={(event) => onChangeOptions('searchInput', event.target.value)}
              onKeyDown={onKeyDown}
              endAdornment={
                <InputAdornment position="end">
                  {filters.searchInput && (
                    <IconButton onClick={handleClearInput}>
                      <ClearIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              }
            />
            <IconButton type="submit" aria-label="search" onClick={onSearchPMSI}>
              <SearchIcon fill="#ED6D91" height="15px" />
            </IconButton>
          </Grid>
          <Button
            variant="contained"
            disableElevation
            startIcon={<FilterList height="15px" fill="#FFF" />}
            className={classes.searchButton}
            onClick={() => setOpen(true)}
          >
            Filtrer
          </Button>

          <PMSIFilters
            open={open}
            onClose={() => setOpen(false)}
            onSubmit={() => setOpen(false)}
            nda={filters.nda}
            onChangeNda={(value) => onChangeOptions('nda', value)}
            code={filters.code}
            onChangeCode={(value) => onChangeOptions('code', value)}
            selectedDiagnosticTypes={filters.selectedDiagnosticTypes}
            onChangeSelectedDiagnosticTypes={(value) => onChangeOptions('selectedDiagnosticTypes', value)}
            startDate={filters.startDate}
            onChangeStartDate={(value) => onChangeOptions('startDate', value)}
            endDate={filters.endDate}
            onChangeEndDate={(value) => onChangeOptions('endDate', value)}
            deidentified={deidentifiedBoolean}
            showDiagnosticTypes={selectedTab === 'diagnostic'}
          />
        </div>
      </Grid>
      <Grid>
        {filters.nda !== '' &&
          filters.nda
            .split(',')
            .map((value) => (
              <Chip
                className={classes.chips}
                key={value}
                label={`NDA: ${value.toUpperCase()}`}
                onDelete={() => handleDeleteChip('nda', value)}
                color="primary"
                variant="outlined"
              />
            ))}
        {filters.code !== '' &&
          filters.code
            .split(',')
            .map((value) => (
              <Chip
                className={classes.chips}
                key={value}
                label={`Code: ${value.toUpperCase()}`}
                onDelete={() => handleDeleteChip('code', value)}
                color="primary"
                variant="outlined"
              />
            ))}
        {filters.startDate && (
          <Chip
            className={classes.chips}
            label={`Après le : ${moment(filters.startDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleDeleteChip('startDate')}
            color="primary"
            variant="outlined"
          />
        )}
        {filters.endDate && (
          <Chip
            className={classes.chips}
            label={`Avant le : ${moment(filters.endDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleDeleteChip('endDate')}
            color="primary"
            variant="outlined"
          />
        )}
        {filters.selectedDiagnosticTypes.length > 0 &&
          filters.selectedDiagnosticTypes.map((diagnosticType) => (
            <Chip
              className={classes.chips}
              key={diagnosticType.id}
              label={capitalizeFirstLetter(diagnosticType.label)}
              onDelete={() => handleDeleteChip('selectedDiagnosticTypes', diagnosticType)}
              color="primary"
              variant="outlined"
            />
          ))}
      </Grid>
      {loading ? (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell align="left" className={classes.tableHeadCell}>
                  {deidentifiedBoolean ? 'NDA chiffré' : 'NDA'}
                </TableCell>
                <TableCell
                  sortDirection={sortBy === 'date' ? sortDirection : false}
                  align="left"
                  className={classes.tableHeadCell}
                >
                  <TableSortLabel
                    active={sortBy === 'date'}
                    direction={sortBy === 'date' ? sortDirection : 'asc'}
                    onClick={handleSort('date')}
                  >
                    Codage le
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sortDirection={sortBy === 'code' ? sortDirection : false}
                  align="center"
                  className={classes.tableHeadCell}
                >
                  <TableSortLabel
                    active={sortBy === 'code'}
                    direction={sortBy === 'code' ? sortDirection : 'asc'}
                    onClick={handleSort('code')}
                  >
                    Code
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  Libellé
                </TableCell>
                {selectedTab === 'diagnostic' && (
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Type
                  </TableCell>
                )}
                <TableCell align="center" className={classes.tableHeadCell}>
                  Unité exécutrice
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patientPmsiList && patientPmsiList.length > 0 ? (
                <>
                  {patientPmsiList.map((row) => {
                    return (
                      <TableRow className={classes.tableBodyRows} key={row.id}>
                        <TableCell align="left">{row.NDA ?? 'Inconnu'}</TableCell>
                        <TableCell align="left">
                          {row.resourceType === 'Condition' &&
                            row.recordedDate &&
                            (new Date(row.recordedDate).toLocaleDateString('fr-FR') ?? 'Date inconnue')}
                          {row.resourceType === 'Claim' &&
                            row.created &&
                            (new Date(row.created).toLocaleDateString('fr-FR') ?? 'Date inconnue')}
                          {row.resourceType === 'Procedure' &&
                            row.performedDateTime &&
                            (new Date(row.performedDateTime).toLocaleDateString('fr-FR') ?? 'Date inconnue')}
                        </TableCell>
                        <TableCell align="center">
                          {row.resourceType === 'Claim'
                            ? row.diagnosis?.[0].packageCode?.coding?.[0].code
                            : // @ts-ignore TODO: There is no class member in Conditon or Procedure FHIR types
                              row.class?.code || row.code?.coding?.[0].code}
                        </TableCell>
                        <TableCell align="center" className={classes.libelle}>
                          {row.resourceType === 'Claim'
                            ? row.diagnosis?.[0].packageCode?.coding?.[0].display
                            : // @ts-ignore TODO: There is no class member in Conditon or Procedure FHIR types
                              row.class?.code || row.code?.coding?.[0].display}
                        </TableCell>
                        {selectedTab === 'diagnostic' && (
                          <TableCell align="center">
                            {row.extension ? row.extension[0].valueString?.toUpperCase() : '-'}
                          </TableCell>
                        )}
                        <TableCell align="center">{row.serviceProvider ?? 'Non renseigné'}</TableCell>
                      </TableRow>
                    )
                  })}
                </>
              ) : (
                <TableRow className={classes.emptyTableRow}>
                  <TableCell colSpan={9} align="left">
                    <Grid container justifyContent="center">
                      <Typography variant="button">{`Aucun ${
                        selectedTab !== 'diagnostic' ? (selectedTab !== 'ccam' ? 'ghm' : 'acte') : 'diagnostic'
                      } à afficher`}</Typography>
                    </Grid>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Pagination
        className={classes.pagination}
        count={Math.ceil(totalPmsi / documentLines)}
        shape="rounded"
        onChange={handleChangePage}
        page={page}
      />
    </Grid>
  )
}
export default PatientPMSI
