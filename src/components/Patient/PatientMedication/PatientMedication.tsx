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
import CommentIcon from '@material-ui/icons/Comment'

import MedicationFilters from 'components/Filters/MedicationFilters/MedicationFilters'
import ModalAdministrationComment from './ModalAdministrationComment/ModalAdministrationComment'

import { MedicationEntry } from 'types'
import { IMedicationRequest, IMedicationAdministration } from '@ahryman40k/ts-fhir-types/lib/R4'

import services from 'services'

import { capitalizeFirstLetter } from 'utils/capitalize'
import displayDigit from 'utils/displayDigit'

import useStyles from './styles'

type PatientMedicationTypes = {
  groupId?: string
  patientId: string
  prescription?: MedicationEntry<IMedicationRequest>[]
  prescriptionTotal: number
  administration?: MedicationEntry<IMedicationAdministration>[]
  administrationTotal: number
  deidentifiedBoolean: boolean
}
const PatientMedication: React.FC<PatientMedicationTypes> = ({
  groupId,
  patientId,
  prescription,
  prescriptionTotal,
  administration,
  administrationTotal,
  deidentifiedBoolean
}) => {
  const classes = useStyles()

  const [loadingStatus, setLoadingStatus] = useState(false)
  const [selectedTab, selectTab] = useState<'prescription' | 'administration'>('prescription')
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
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

  const _fetchMedication = async (
    deidentified: boolean,
    page: number,
    patientId: string,
    selectedTab: 'prescription' | 'administration',
    searchInput: string,
    nda: string,
    sortBy: string,
    sortDirection: string,
    selectedPrescriptionTypes: { id: string; label: string }[],
    selectedAdministrationRoutes: { id: string; label: string }[],
    startDate?: string | null,
    endDate?: string | null
  ) => {
    setLoadingStatus(true)
    if (!services.patients.fetchMedication || typeof services.patients?.fetchMedication !== 'function') return

    const medicationResp = await services.patients.fetchMedication(
      deidentified,
      page,
      patientId,
      selectedTab,
      searchInput,
      nda,
      sortBy,
      sortDirection,
      selectedPrescriptionTypes.map(({ id }) => id).join(','),
      selectedAdministrationRoutes.map(({ id }) => id).join(','),
      groupId,
      startDate ?? undefined,
      endDate ?? undefined
    )

    setData(medicationResp?.medicationData ?? [])
    setTotal(medicationResp?.medicationTotal ?? 0)
    setLoadingStatus(false)
  }

  const handleClearInput = () => {
    setSearchInput('')
    setPage(1)
    _fetchMedication(
      deidentifiedBoolean,
      1,
      patientId,
      selectedTab,
      '',
      filter.nda,
      sort.by,
      sort.direction,
      filter.selectedPrescriptionTypes ?? [],
      filter.selectedAdministrationRoutes ?? [],
      filter.startDate,
      filter.endDate
    )
  }

  const handleSort = (property: any) => (event: React.MouseEvent<unknown> /*eslint-disable-line*/) => {
    const isAsc: boolean = sort.by === property && sort.direction === 'asc'
    const newDirection = isAsc ? 'desc' : 'asc'

    setSort({ by: property, direction: newDirection })
    setPage(1)
    _fetchMedication(
      deidentifiedBoolean,
      1,
      patientId,
      selectedTab,
      searchInput,
      filter.nda,
      property,
      newDirection,
      filter.selectedPrescriptionTypes ?? [],
      filter.selectedAdministrationRoutes ?? [],
      filter.startDate,
      filter.endDate
    )
  }

  const handleChangePage = (event?: React.ChangeEvent<unknown>, value?: number) => {
    setPage(value ? value : 1)
    setLoadingStatus(true)
    _fetchMedication(
      deidentifiedBoolean,
      value ? value : 1,
      patientId,
      selectedTab,
      searchInput,
      filter.nda,
      sort.by,
      sort.direction,
      filter.selectedPrescriptionTypes ?? [],
      filter.selectedAdministrationRoutes ?? [],
      filter.startDate,
      filter.endDate
    )
  }

  const handleChangeSearchInput = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSearchInput(event.target.value)
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
      default:
        console.log('filterName :>> ', filterName)
        console.log('value :>> ', value)
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
  }, [filter]) // eslint-disable-line

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
    switch (selectedTab) {
      case 'prescription':
        setData(prescription ?? [])
        setTotal(prescriptionTotal ?? 0)
        break
      case 'administration':
        setData(administration ?? [])
        setTotal(administrationTotal ?? 0)
        break
      default:
        setData([])
        setTotal(0)
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
          {total || 0} /{' '}
          {selectedTab === 'prescription'
            ? `${prescriptionTotal ?? 0} prescription(s)`
            : `${administrationTotal} administration(s)`}
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
                <TableCell align="center" className={classes.tableHeadCell}>
                  <TableSortLabel
                    active={sort.by === 'medication-text'}
                    direction={sort.by === 'medication-text' ? sort.direction : 'asc'}
                    onClick={handleSort('medication-text')}
                  >
                    Libellé
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
              {data ? (
                <>
                  {data.map((row) => {
                    const nda = row.NDA
                    const date =
                      selectedTab === 'prescription'
                        ? row.dispenseRequest?.validityPeriod?.start
                        : row.effectivePeriod?.start
                    const codeATC = selectedTab === 'prescription' ? row.category?.[0]?.id : row.category?.id

                    const codeUCD = row.contained?.[0]?.code?.coding?.[0]?.id
                    const name = row.contained?.[0]?.code?.coding?.[0]?.display

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
                        <TableCell align="center">{codeATC === 'No matching concept' ? '-' : codeATC ?? '-'}</TableCell>
                        <TableCell align="center">{codeUCD === 'No matching concept' ? '-' : codeUCD ?? '-'}</TableCell>
                        <TableCell align="center" className={classes.libelle}>
                          {name === 'No matching concept' ? '-' : name ?? '-'}
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

      <ModalAdministrationComment
        open={selectedComment !== null}
        comment={selectedComment ?? ''}
        handleClose={() => setSelectedComment(null)}
      />
    </Grid>
  )
}
export default PatientMedication
