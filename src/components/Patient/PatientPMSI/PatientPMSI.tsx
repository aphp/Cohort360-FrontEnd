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

import PMSIFilters from '../../Filters/PMSIFilters/PMSIFilters'

import ClearIcon from '@material-ui/icons/Clear'
import { ReactComponent as SearchIcon } from '../../../assets/icones/search.svg'
import { ReactComponent as FilterList } from '../../../assets/icones/filter.svg'

import { fetchPMSI } from '../../../services/patient'

import useStyles from './styles'
import { PMSIEntry } from 'types'
import { IClaim, ICondition, IProcedure } from '@ahryman40k/ts-fhir-types/lib/R4'
import { capitalizeFirstLetter } from 'utils/capitalize'

type PatientPMSITypes = {
  groupId?: string
  patientId: string
  diagnostic?: PMSIEntry<ICondition>[]
  diagnosticTotal: number
  ccam?: PMSIEntry<IProcedure>[]
  ccamTotal: number
  ghm?: PMSIEntry<IClaim>[]
  ghmTotal: number
  deidentifiedBoolean: boolean
  sortBy: string
  sortDirection: 'asc' | 'desc'
}
const PatientPMSI: React.FC<PatientPMSITypes> = ({
  groupId,
  patientId,
  diagnostic,
  diagnosticTotal,
  ccam,
  ccamTotal,
  ghm,
  ghmTotal,
  deidentifiedBoolean,
  sortBy,
  sortDirection
}) => {
  const classes = useStyles()
  const [selectedTab, selectTab] = useState<'CIM10' | 'CCAM' | 'GHM'>('CIM10')
  const [data, setData] = useState<PMSIEntry<IClaim | ICondition | IProcedure>[] | undefined>([])
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [open, setOpen] = useState(false)
  const [nda, setNda] = useState('')
  const [code, setCode] = useState('')
  const [selectedDiagnosticTypes, setSelectedDiagnosticTypes] = useState<any[]>([])
  const [startDate, setStartDate] = useState<string | undefined>(undefined)
  const [endDate, setEndDate] = useState<string | undefined>(undefined)
  const [_sortBy, setSortBy] = useState(sortBy)
  const [_sortDirection, setSortDirection] = useState(sortDirection)
  const [showFilterChip, setShowFilterChip] = useState(false)

  const documentLines = 20 // Number of desired lines in the document array

  const _fetchPMSI = (
    deidentified: boolean,
    page: number,
    patientId: string,
    selectedTab: 'CIM10' | 'CCAM' | 'GHM',
    searchInput: string,
    nda: string,
    code: string,
    diagnosticTypes: string[],
    sortBy: string,
    sortDirection: string,
    startDate?: string,
    endDate?: string
  ) => {
    setLoadingStatus(true)

    const selectedDiagnosticTypesCodes = selectedDiagnosticTypes.map((diagnosticType) => diagnosticType.id)

    fetchPMSI(
      deidentified,
      page,
      patientId,
      selectedTab,
      searchInput,
      nda,
      code,
      selectedDiagnosticTypesCodes,
      sortBy,
      sortDirection,
      groupId,
      startDate,
      endDate
    )
      .then((pmsiResp) => {
        setData(pmsiResp?.pmsiData ?? [])
        setTotal(pmsiResp?.pmsiTotal ?? 0)
      })
      .catch((error) => {
        setData([])
        setTotal(0)
        console.log(error)
      })
      .then(() => setLoadingStatus(false))
  }

  const handleClearInput = () => {
    setSearchInput('')
    setPage(1)
    _fetchPMSI(
      deidentifiedBoolean,
      1,
      patientId,
      selectedTab,
      '',
      nda,
      code,
      selectedDiagnosticTypes,
      _sortBy,
      _sortDirection,
      startDate,
      endDate
    )
  }

  const handleSort = (property: any) => (event: React.MouseEvent<unknown> /*eslint-disable-line*/) => {
    const isAsc: boolean = _sortBy === property && _sortDirection === 'asc'
    const newDirection = isAsc ? 'desc' : 'asc'

    setSortDirection(newDirection)
    setSortBy(property)
    setPage(1)
    _fetchPMSI(
      deidentifiedBoolean,
      1,
      patientId,
      selectedTab,
      searchInput,
      nda,
      code,
      selectedDiagnosticTypes,
      property,
      newDirection,
      startDate,
      endDate
    )
  }

  const handleChangePage = (event?: React.ChangeEvent<unknown>, value?: number) => {
    setPage(value ? value : 1)
    setLoadingStatus(true)
    _fetchPMSI(
      true,
      value ? value : 1,
      patientId,
      selectedTab,
      searchInput,
      nda,
      code,
      selectedDiagnosticTypes,
      _sortBy,
      _sortDirection,
      startDate,
      endDate
    )
  }

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const handleCloseDialog = () => {
    setOpen(false)
    setShowFilterChip(true)
  }

  const handleChangeSearchInput = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSearchInput(event.target.value)
  }

  const handleDeleteChip = (filterName: string, value?: string) => {
    switch (filterName) {
      case 'nda':
        value &&
          setNda(
            nda
              .split(',')
              .filter((item) => item !== value)
              .join()
          )
        break
      case 'code':
        value &&
          setCode(
            code
              .split(',')
              .filter((item) => item !== value)
              .join()
          )
        break
      case 'startDate':
        setStartDate(undefined)
        break
      case 'endDate':
        setEndDate(undefined)
        break
      case 'selectedDiagnosticTypes':
        value && setSelectedDiagnosticTypes(selectedDiagnosticTypes.filter((item) => item !== value))
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

  useEffect(() => {
    handleChangePage()
  }, [nda, code, startDate, endDate, selectedDiagnosticTypes]) // eslint-disable-line

  useEffect(() => {
    setPage(1)
    setSearchInput('')
    switch (selectedTab) {
      case 'CIM10':
        setData(diagnostic ?? [])
        setTotal(diagnosticTotal ?? 0)
        setNda('')
        setCode('')
        setSelectedDiagnosticTypes([])
        setStartDate(undefined)
        setEndDate(undefined)
        break
      case 'CCAM':
        setData(ccam ?? [])
        setTotal(ccamTotal ?? 0)
        setNda('')
        setCode('')
        setSelectedDiagnosticTypes([])
        setStartDate(undefined)
        setEndDate(undefined)
        break
      case 'GHM':
        setData(ghm ?? [])
        setTotal(ghmTotal ?? 0)
        setNda('')
        setCode('')
        setSelectedDiagnosticTypes([])
        setStartDate(undefined)
        setEndDate(undefined)
        break
      default:
        setData([])
        break
    }
  }, [patientId, selectedTab]) // eslint-disable-line

  return (
    <Grid container item xs={11} justify="flex-end" className={classes.documentTable}>
      <Grid item container justify="space-between" alignItems="center">
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
            value="CIM10"
          />
          <Tab classes={{ selected: classes.selected }} className={classes.tabTitle} label="Actes CCAM" value="CCAM" />
          <Tab classes={{ selected: classes.selected }} className={classes.tabTitle} label="GHM" value="GHM" />
        </Tabs>
        <Typography variant="button">
          {total || 0} /{' '}
          {selectedTab === 'CIM10'
            ? `${diagnosticTotal ?? 0} diagnostic(s)`
            : selectedTab === 'CCAM'
            ? `${ccamTotal} acte(s)`
            : `${ghmTotal} GHM`}
        </Typography>
        <div className={classes.documentButtons}>
          <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
            <InputBase
              placeholder="Rechercher"
              className={classes.input}
              value={searchInput}
              onChange={handleChangeSearchInput}
              onKeyDown={onKeyDown}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={handleClearInput}>{searchInput && <ClearIcon />}</IconButton>
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
            onClick={handleOpenDialog}
          >
            Filtrer
          </Button>
          <PMSIFilters
            open={open}
            onClose={() => setOpen(false)}
            onSubmit={handleCloseDialog}
            nda={nda}
            onChangeNda={setNda}
            code={code}
            onChangeCode={setCode}
            startDate={startDate}
            onChangeStartDate={setStartDate}
            endDate={endDate}
            onChangeEndDate={setEndDate}
            deidentified={deidentifiedBoolean}
            showDiagnosticTypes={selectedTab === 'CIM10'}
            selectedDiagnosticTypes={selectedDiagnosticTypes}
            onChangeSelectedDiagnosticTypes={setSelectedDiagnosticTypes}
          />
        </div>
      </Grid>
      <Grid>
        {showFilterChip &&
          nda !== '' &&
          nda
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
        {showFilterChip &&
          code !== '' &&
          code
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
        {showFilterChip && startDate && (
          <Chip
            className={classes.chips}
            label={`Après le : ${moment(startDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleDeleteChip('startDate')}
            color="primary"
            variant="outlined"
          />
        )}
        {showFilterChip && endDate && (
          <Chip
            className={classes.chips}
            label={`Avant le : ${moment(endDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleDeleteChip('endDate')}
            color="primary"
            variant="outlined"
          />
        )}
        {showFilterChip &&
          selectedDiagnosticTypes.length > 0 &&
          selectedDiagnosticTypes.map((diagnosticType) => (
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
      {loadingStatus ? (
        <Grid container justify="center">
          <CircularProgress />
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell align="left" className={classes.tableHeadCell}>
                  {deidentifiedBoolean ? 'ID Technique Visite' : 'NDA'}
                </TableCell>
                <TableCell
                  sortDirection={_sortBy === 'date' ? _sortDirection : false}
                  align="left"
                  className={classes.tableHeadCell}
                >
                  <TableSortLabel
                    active={_sortBy === 'date'}
                    direction={_sortBy === 'date' ? _sortDirection : 'asc'}
                    onClick={handleSort('date')}
                  >
                    Codage le
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sortDirection={_sortBy === 'code' ? _sortDirection : false}
                  align="center"
                  className={classes.tableHeadCell}
                >
                  <TableSortLabel
                    active={_sortBy === 'code'}
                    direction={_sortBy === 'code' ? _sortDirection : 'asc'}
                    onClick={handleSort('code')}
                  >
                    Code
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  Libellé
                </TableCell>
                {selectedTab === 'CIM10' && (
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
              {data ? (
                <>
                  {data.map((row) => {
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
                        {selectedTab === 'CIM10' && (
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
                <Grid container justify="center">
                  <Typography variant="button">Aucun document à afficher</Typography>
                </Grid>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Pagination
        className={classes.pagination}
        count={Math.ceil(total / documentLines)}
        shape="rounded"
        onChange={handleChangePage}
        page={page}
      />
    </Grid>
  )
}
export default PatientPMSI
