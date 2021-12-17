import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
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
import CommentIcon from '@material-ui/icons/Comment'

import MedicationFilters from 'components/Filters/MedicationFilters/MedicationFilters'
import ModalAdministrationComment from './ModalAdministrationComment/ModalAdministrationComment'

import { useAppSelector } from 'state'
import { fetchMedication } from 'state/patient'

import { capitalizeFirstLetter } from 'utils/capitalize'
import displayDigit from 'utils/displayDigit'

import useStyles from './styles'

type PatientMedicationTypes = {
  groupId?: string
}
const PatientMedication: React.FC<PatientMedicationTypes> = ({ groupId }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))

  const [selectedTab, selectTab] = useState<'prescription' | 'administration'>('prescription')

  const medicationPatient = patient?.medication ?? {}
  const currrentMedication = medicationPatient[selectedTab] ?? {
    loading: false,
    count: 0,
    total: 0,
    list: []
  }

  const loading = currrentMedication.loading ?? false
  const deidentifiedBoolean = patient?.deidentified ?? false
  const totalMedication = currrentMedication.count ?? 0
  const totalAllMedication = currrentMedication.total ?? 0

  const [patientMedicationList, setPatientMedicationList] = useState<any[]>([])

  const [page, setPage] = useState(1)

  const [searchInput, setSearchInput] = useState('')

  const [open, setOpen] = useState<string | null>(null)
  const [selectedComment, setSelectedComment] = useState<string | null>(null)

  const [filter, setFilter] = useState<{
    nda: string
    startDate: string | null
    endDate: string | null
    selectedPrescriptionTypes: { id: string; label: string }[]
    selectedAdministrationRoutes: { id: string; label: string }[]
  }>({
    nda: '',
    selectedPrescriptionTypes: [],
    selectedAdministrationRoutes: [],
    startDate: null,
    endDate: null
  })
  const [sort, setSort] = useState<{ by: string; direction: 'asc' | 'desc' }>({ by: 'Period-start', direction: 'asc' })

  const documentLines = 20 // Number of desired lines in the document array

  const _fetchMedication = async (page: number) => {
    dispatch(
      fetchMedication({
        selectedTab,
        groupId,
        options: {
          page,
          sort,
          filters: {
            searchInput,
            nda: filter.nda,
            selectedPrescriptionTypes: filter.selectedPrescriptionTypes,
            selectedAdministrationRoutes: filter.selectedAdministrationRoutes,
            startDate: filter.startDate,
            endDate: filter.endDate
          }
        }
      })
    )
  }

  const handleClearInput = () => {
    setSearchInput('')
    _fetchMedication(1)
  }

  const handleSort = (property: any) => (event: React.MouseEvent<unknown> /*eslint-disable-line*/) => {
    const isAsc: boolean = sort.by === property && sort.direction === 'asc'
    const newDirection = isAsc ? 'desc' : 'asc'

    setSort({ by: property, direction: newDirection })
    setPage(1)
  }

  const handleChangePage = (event?: React.ChangeEvent<unknown>, value?: number) => {
    setPage(value ? value : 1)
    _fetchMedication(value ? value : 1)
  }

  const handleChangeFilter = (
    filterName: 'nda' | 'startDate' | 'endDate' | 'selectedPrescriptionTypes' | 'selectedAdministrationRoutes',
    value: any
  ) => {
    switch (filterName) {
      case 'selectedAdministrationRoutes':
      case 'selectedPrescriptionTypes':
      case 'nda':
      case 'startDate':
      case 'endDate':
        setFilter((prevState) => ({ ...prevState, [filterName]: value }))
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
  }, [filter, sort]) // eslint-disable-line

  useEffect(() => {
    setPage(1)
    setSearchInput('')
    setFilter({
      nda: '',
      selectedPrescriptionTypes: [],
      selectedAdministrationRoutes: [],
      startDate: null,
      endDate: null
    })
  }, [selectedTab]) // eslint-disable-line

  useEffect(() => {
    const medicationPatient = patient?.medication ?? {}
    const currrentMedication = medicationPatient[selectedTab] ?? {
      loading: false,
      count: 0,
      total: 0,
      list: []
    }
    setPatientMedicationList(currrentMedication.list)
  }, [currrentMedication, currrentMedication?.list]) // eslint-disable-line

  return (
    <Grid container item xs={11} justify="flex-end" className={classes.documentTable}>
      <Grid item container justify="space-between" alignItems="center" className={classes.filterAndSort}>
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
            label="Prescription"
            value="prescription"
          />
          <Tab
            classes={{ selected: classes.selected }}
            className={classes.tabTitle}
            label="Administration"
            value="administration"
          />
        </Tabs>
        <Typography variant="button">
          {totalMedication || 0} /{' '}
          {selectedTab === 'prescription'
            ? `${totalAllMedication ?? 0} prescription(s)`
            : `${totalAllMedication ?? 0} administration(s)`}
        </Typography>
        <div className={classes.documentButtons}>
          <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
            <InputBase
              placeholder="Rechercher"
              className={classes.input}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={onKeyDown}
              endAdornment={
                <InputAdornment position="end">
                  {searchInput && (
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
            onClick={() => setOpen('filter')}
          >
            Filtrer
          </Button>

          <MedicationFilters
            open={open === 'filter'}
            onClose={() => setOpen(null)}
            onSubmit={() => setOpen(null)}
            nda={filter.nda}
            onChangeNda={(_nda: string) => handleChangeFilter('nda', _nda)}
            startDate={filter.startDate}
            onChangeStartDate={(_startDate: string | null) => handleChangeFilter('startDate', _startDate)}
            endDate={filter.endDate}
            onChangeEndDate={(_endDate: string | null) => handleChangeFilter('endDate', _endDate)}
            deidentified={deidentifiedBoolean}
            selectedPrescriptionTypes={filter.selectedPrescriptionTypes}
            onChangeSelectedPrescriptionTypes={(_selectedPrescriptionTypes: { id: string; label: string }[]) =>
              handleChangeFilter('selectedPrescriptionTypes', _selectedPrescriptionTypes)
            }
            showPrescriptionTypes={selectedTab === 'prescription'}
            selectedAdministrationRoutes={filter.selectedAdministrationRoutes}
            onChangeSelectedAdministrationRoutes={(_selectedAdministrationRoutes: { id: string; label: string }[]) =>
              handleChangeFilter('selectedAdministrationRoutes', _selectedAdministrationRoutes)
            }
            showAdministrationRoutes={selectedTab === 'administration'}
          />
        </div>
      </Grid>

      <Grid>
        {filter.selectedPrescriptionTypes.length > 0 &&
          filter.selectedPrescriptionTypes.map((prescriptionType) => (
            <Chip
              className={classes.chips}
              key={prescriptionType.id}
              label={capitalizeFirstLetter(prescriptionType.label)}
              onDelete={() =>
                handleChangeFilter(
                  'selectedPrescriptionTypes',
                  filter.selectedPrescriptionTypes.filter(({ id }) => id !== prescriptionType.id)
                )
              }
              color="primary"
              variant="outlined"
            />
          ))}
        {filter.startDate && (
          <Chip
            className={classes.chips}
            label={`Après le : ${moment(filter.startDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleChangeFilter('startDate', null)}
            color="primary"
            variant="outlined"
          />
        )}
        {filter.endDate && (
          <Chip
            className={classes.chips}
            label={`Avant le : ${moment(filter.endDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleChangeFilter('endDate', null)}
            color="primary"
            variant="outlined"
          />
        )}
      </Grid>

      {loading ? (
        <Grid container justify="center">
          <CircularProgress />
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell align="left" className={classes.tableHeadCell}>
                  {deidentifiedBoolean ? (
                    'NDA chiffré'
                  ) : (
                    <TableSortLabel
                      active={sort.by === 'encounter'}
                      direction={sort.by === 'encounter' ? sort.direction : 'asc'}
                      onClick={handleSort('encounter')}
                    >
                      NDA
                    </TableSortLabel>
                  )}
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  <TableSortLabel
                    active={sort.by === 'Period-start'}
                    direction={sort.by === 'Period-start' ? sort.direction : 'asc'}
                    onClick={handleSort('Period-start')}
                  >
                    {selectedTab === 'prescription' ? 'Date de prescription' : "Date d'administration"}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  <TableSortLabel
                    active={sort.by === 'class'}
                    direction={sort.by === 'class' ? sort.direction : 'asc'}
                    onClick={handleSort('class')}
                  >
                    Code ATC
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  <TableSortLabel
                    active={sort.by === 'code'}
                    direction={sort.by === 'code' ? sort.direction : 'asc'}
                    onClick={handleSort('code')}
                  >
                    Code UCD
                  </TableSortLabel>
                </TableCell>
                {selectedTab === 'prescription' && (
                  <TableCell align="center" className={classes.tableHeadCell}>
                    <TableSortLabel
                      active={sort.by === 'type'}
                      direction={sort.by === 'type' ? sort.direction : 'asc'}
                      onClick={handleSort('type')}
                    >
                      Type de prescription
                    </TableSortLabel>
                  </TableCell>
                )}
                <TableCell align="center" className={classes.tableHeadCell}>
                  <TableSortLabel
                    active={sort.by === 'route'}
                    direction={sort.by === 'route' ? sort.direction : 'asc'}
                    onClick={handleSort('route')}
                  >
                    Voie d'administration
                  </TableSortLabel>
                </TableCell>
                {selectedTab === 'administration' && (
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Quantité
                  </TableCell>
                )}
                <TableCell align="center" className={classes.tableHeadCell}>
                  Unité exécutrice
                </TableCell>
                {selectedTab === 'administration' && deidentifiedBoolean === false && (
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Commentaire
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {patientMedicationList && patientMedicationList.length > 0 ? (
                <>
                  {patientMedicationList.map((row) => {
                    const nda = row.NDA
                    const date =
                      selectedTab === 'prescription'
                        ? row.dispenseRequest?.validityPeriod?.start
                        : row.effectivePeriod?.start
                    const codeATC = selectedTab === 'prescription' ? row.category?.[0]?.id : row.category?.id
                    const displayATC = selectedTab === 'prescription' ? row.category?.[0]?.text : row.category?.text

                    const codeUCD = row.contained?.[0]?.code?.coding?.[0]?.id
                    const displayUCD = row.contained?.[0]?.code?.coding?.[0]?.display

                    const prescriptionType =
                      selectedTab === 'prescription' &&
                      (row.extension?.find((extension: any) => extension.url === 'type') || {}).valueString
                    const administrationRoute =
                      selectedTab === 'prescription'
                        ? row.dosageInstruction?.[0]?.route?.text
                        : row.dosage?.route?.coding?.[0]?.display
                    const dose = selectedTab === 'administration' && displayDigit(+row.dosage?.dose?.value)
                    const unit = selectedTab === 'administration' && row.dosage?.dose?.unit
                    const serviceProvider = row.serviceProvider

                    const comment = selectedTab === 'administration' ? row.dosage?.text : null

                    return (
                      <TableRow className={classes.tableBodyRows} key={row.id}>
                        <TableCell align="left">{nda ?? 'Inconnu'}</TableCell>
                        <TableCell align="center">
                          {date ? new Date(date).toLocaleDateString('fr-FR') : 'Date inconnue'}
                        </TableCell>
                        <TableCell align="center">
                          <Typography>
                            {codeATC === 'No matching concept' || codeATC === 'Non Renseigné' ? '' : codeATC ?? ''}
                          </Typography>
                          <Typography className={classes.libelle}>
                            {displayATC === 'No matching concept' ? '-' : displayATC ?? '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography>
                            {codeUCD === 'No matching concept' || codeUCD === 'Non Renseigné' ? '' : codeUCD ?? ''}
                          </Typography>
                          <Typography className={classes.libelle}>
                            {displayUCD === 'No matching concept' ? '-' : displayUCD ?? '-'}
                          </Typography>
                        </TableCell>
                        {selectedTab === 'prescription' && (
                          <TableCell align="center">{prescriptionType ?? '-'}</TableCell>
                        )}
                        <TableCell align="center">
                          {administrationRoute === 'No matching concept' ? '-' : administrationRoute ?? '-'}
                        </TableCell>
                        {selectedTab === 'administration' && (
                          <TableCell align="center">
                            {unit !== 'Non Renseigné' ? (
                              <>
                                {dose} {unit}
                              </>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        )}
                        <TableCell align="center">{serviceProvider ?? '-'}</TableCell>
                        {selectedTab === 'administration' && deidentifiedBoolean === false && (
                          <TableCell align="center">
                            <IconButton onClick={() => setSelectedComment(comment)}>
                              <CommentIcon />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </>
              ) : (
                <TableRow className={classes.emptyTableRow}>
                  <TableCell colSpan={9} align="left">
                    <Grid container justify="center">
                      <Typography variant="button">{`Aucune ${
                        selectedTab === 'prescription' ? 'prescription' : 'administration'
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
        count={Math.ceil(totalAllMedication / documentLines)}
        shape="rounded"
        onChange={handleChangePage}
        page={page}
      />

      <ModalAdministrationComment
        open={selectedComment !== null}
        comment={selectedComment ?? ''}
        handleClose={() => setSelectedComment(null)}
      />
    </Grid>
  )
}
export default PatientMedication
