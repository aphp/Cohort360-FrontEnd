import React, { useEffect, useMemo, useRef, useState } from 'react'

import Grid from '@mui/material/Grid'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import DataTableMedication from 'components/DataTable/DataTableMedication'

import { CriteriaName, HierarchyElement, LoadingStatus, TabType } from 'types'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchMedication } from 'state/patient'

import useStyles from './styles'
import { cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import Searchbar from 'components/ui/Searchbar'
import { CircularProgress, useMediaQuery, useTheme } from '@mui/material'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Tabs from 'components/ui/Tabs'
import { FilterKeys } from 'types/searchCriterias'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import services from 'services/aphp'
import { selectFiltersAsArray } from 'utils/filters'
import { BlockWrapper } from 'components/ui/Layout'
import useSearchCriterias, { initMedSearchCriterias } from 'reducers/searchCriteriasReducer'
import Chip from 'components/ui/Chip'
import AdministrationTypesFilter from 'components/Filters/AdministrationTypesFilter'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import NdaFilter from 'components/Filters/NdaFilter'
import PrescriptionTypesFilter from 'components/Filters/PrescriptionTypesFilter'

type PatientMedicationProps = {
  groupId?: string
}

enum Medication {
  PRESCRIPTION = 'prescription',
  ADMINISTRATION = 'administration'
}

enum MedicationLabel {
  PRESCRIPTION = 'Prescription',
  ADMINISTRATION = 'Administration'
}

const PatientMedication = ({ groupId }: PatientMedicationProps) => {
  const { classes } = useStyles()
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.between('sm', 'lg'))
  const isSm = useMediaQuery(theme.breakpoints.down('md'))
  const [toggleModal, setToggleModal] = useState(false)

  const dispatch = useAppDispatch()
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [page, setPage] = useState(1)
  const [
    {
      orderBy,
      searchInput,
      filters,
      filters: { nda, prescriptionTypes, startDate, endDate, administrationRoutes, executiveUnits }
    },
    { changeOrderBy, changeSearchInput, addFilters, removeFilter, removeSearchCriterias }
  ] = useSearchCriterias(initMedSearchCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ nda, prescriptionTypes, administrationRoutes, startDate, endDate, executiveUnits })
  }, [nda, prescriptionTypes, administrationRoutes, startDate, endDate, executiveUnits])

  const [selectedTab, setSelectedTab] = useState<TabType<Medication, MedicationLabel>>({
    id: Medication.PRESCRIPTION,
    label: MedicationLabel.PRESCRIPTION
  })
  const medicationTabs: TabType<Medication, MedicationLabel>[] = [
    { id: Medication.PRESCRIPTION, label: MedicationLabel.PRESCRIPTION },
    { id: Medication.ADMINISTRATION, label: MedicationLabel.ADMINISTRATION }
  ]
  const searchResults = {
    deidentified: patient?.deidentified || false,
    nb: patient?.medication?.[selectedTab.id]?.count ?? 0,
    total: patient?.medication?.[selectedTab.id]?.total ?? 0,
    list: patient?.medication?.[selectedTab.id]?.list ?? [],
    label: selectedTab.id === Medication.PRESCRIPTION ? 'prescription(s)' : 'administration(s)'
  }
  const [allAdministrationRoutes, setAdministrationRoutes] = useState<HierarchyElement[]>([])
  const [allPrescriptionTypes, setPrescriptionTypes] = useState<HierarchyElement[]>([])

  const controllerRef = useRef<AbortController | null>(null)

  const _fetchMedication = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchMedication({
          options: {
            selectedTab: selectedTab.id,
            page,
            searchCriterias: {
              orderBy,
              searchInput,
              filters: {
                nda,
                administrationRoutes,
                prescriptionTypes,
                startDate,
                endDate,
                executiveUnits
              }
            }
          },
          groupId,
          signal: controllerRef.current?.signal
        })
      )
      if (response.payload.error) {
        throw response.payload.error
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      } else {
        setLoadingStatus(LoadingStatus.SUCCESS)
      }
    }
  }

  useEffect(() => {
    const _fetchPrescriptionsAdministrations = async () => {
      try {
        const [prescriptions, administrations] = await Promise.all([
          services.cohortCreation.fetchPrescriptionTypes(),
          services.cohortCreation.fetchAdministrations()
        ])
        setAdministrationRoutes(administrations)
        setPrescriptionTypes(prescriptions)
      } catch (e) {
        /* empty */
      }
    }
    _fetchPrescriptionsAdministrations()
  }, [])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [searchInput, nda, startDate, endDate, prescriptionTypes, administrationRoutes, orderBy, executiveUnits])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      _fetchMedication()
    }
  }, [loadingStatus])

  useEffect(() => {
    setPage(1)
    removeSearchCriterias()
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [selectedTab])

  return (
    <Grid container justifyContent="flex-end" className={classes.documentTable}>
      <BlockWrapper item xs={12} margin={'20px 0px 10px'}>
        <Searchbar>
          <Grid container item xs={12} md={12} lg={8} xl={8} style={isSm ? { flexWrap: 'wrap-reverse' } : {}}>
            <Grid item xs={12} md={5} lg={5} xl={5}>
              <Tabs
                values={medicationTabs}
                active={selectedTab}
                onchange={(value: TabType<Medication, MedicationLabel>) => setSelectedTab(value)}
              />
            </Grid>
            <Grid
              container
              justifyContent={isSm ? 'flex-start' : isMd ? 'flex-end' : 'center'}
              alignItems="end"
              item
              xs={12}
              md={7}
              lg={7}
              xl={7}
              style={isSm ? { marginBottom: 20 } : {}}
            >
              {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && (
                <CircularProgress />
              )}
              {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
                <DisplayDigits nb={searchResults.nb} total={searchResults.total} label={searchResults.label} />
              )}
            </Grid>
          </Grid>

          <Grid container item xs={12} md={12} lg={4} xl={4} justifyContent="flex-end">
            <SearchInput
              value={searchInput}
              placeholder={'Rechercher'}
              width="70%"
              onchange={(newValue: string) => changeSearchInput(newValue)}
            />
            <Button width={'30%'} icon={<FilterList height="15px" fill="#FFF" />} onClick={() => setToggleModal(true)}>
              Filtrer
            </Button>
            <Modal
              title="Filtrer par :"
              open={toggleModal}
              width={'600px'}
              onClose={() => setToggleModal(false)}
              onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
            >
              {!searchResults.deidentified && <NdaFilter name={FilterKeys.NDA} value={nda} />}
              {selectedTab.id === Medication.PRESCRIPTION && (
                <PrescriptionTypesFilter
                  value={prescriptionTypes}
                  name={FilterKeys.PRESCRIPTION_TYPES}
                  allAdministrationTypes={allPrescriptionTypes}
                />
              )}
              {selectedTab.id === Medication.ADMINISTRATION && (
                <AdministrationTypesFilter
                  value={administrationRoutes}
                  name={FilterKeys.ADMINISTRATION_ROUTES}
                  allAdministrationTypes={allAdministrationRoutes}
                />
              )}
              <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
              <ExecutiveUnitsFilter
                value={executiveUnits}
                name={FilterKeys.EXECUTIVE_UNITS}
                criteriaName={CriteriaName.Medication}
              />
            </Modal>
          </Grid>
        </Searchbar>
      </BlockWrapper>
      {filtersAsArray.length > 0 && (
        <Grid item xs={12} margin="0px 0px 10px">
          {filtersAsArray.map((filter, index) => (
            <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
          ))}
        </Grid>
      )}
      <Grid item xs={12}>
        <DataTableMedication
          loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
          selectedTab={selectedTab.id}
          medicationsList={searchResults.list}
          deidentified={searchResults.deidentified}
          orderBy={orderBy}
          setOrderBy={(orderBy) => changeOrderBy(orderBy)}
          page={page}
          setPage={(newPage) => setPage(newPage)}
          total={searchResults.nb}
        />
      </Grid>
    </Grid>
  )
}
export default PatientMedication
