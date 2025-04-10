import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Divider, Drawer, Grid, IconButton, Typography } from '@mui/material'
import { ChevronRight, Sort } from '@mui/icons-material'
import FilterList from 'assets/icones/filter.svg?react'

import { selectFiltersAsArray } from 'utils/filters'
import { cancelPendingRequest } from 'utils/abortController'
import { getCleanGroupId } from 'utils/paginationUtils'
import services from 'services/aphp'
import { CohortPatient, DTTB_ResultsType as ResultsType, LoadingStatus } from 'types'

import {
  Direction,
  FilterKeys,
  Order,
  OrderBy,
  OrderByKeys,
  SearchByTypes,
  genderOptions,
  orderByListPatients,
  orderByListPatientsDeidentified,
  orderDirection,
  searchByListPatients,
  vitalStatusesOptions
} from 'types/searchCriterias'

import Button from 'components/ui/Button'
import Chip from 'components/ui/Chip'
import { BlockWrapper } from 'components/ui/Layout'
import Modal from 'components/ui/Modal'
import Searchbar from 'components/ui/Searchbar'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Select from 'components/ui/Searchbar/Select'

import { CanceledError } from 'axios'

import useStyles from './styles'
import ListPatient from 'components/DataTable/ListPatient'
import DisplayLocked from 'components/ui/Display/DisplayLocked'
import useSearchCriterias, { initPatientsSearchCriterias } from 'reducers/searchCriteriasReducer'
import BirthdatesRangesFilter from 'components/Filters/BirthdatesRangesFilters'
import CheckboxsFilter from 'components/Filters/CheckboxsFilter'
import RadioGroupFilter from 'components/Filters/RadioGroupFilter'
import SelectFilter from 'components/Filters/SelectFilter'

type PatientSidebarProps = {
  total: number
  patients?: CohortPatient[]
  openDrawer: boolean
  onClose: () => void
  deidentifiedBoolean: boolean
}

const PatientSidebar = ({ total, patients, openDrawer, onClose, deidentifiedBoolean }: PatientSidebarProps) => {
  const { classes } = useStyles()
  const [searchParams] = useSearchParams()
  const [toggleFiltersModal, setToggleFiltersModal] = useState(false)
  const [toggleSortModal, setToggleSortModal] = useState(false)
  const [page, setPage] = useState(1)
  const [patientsResult, setPatientsResult] = useState<ResultsType>({ nb: 0, total })
  const [patientsList, setPatientsList] = useState<CohortPatient[]>(patients ?? [])
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)

  const [
    {
      orderBy,
      searchBy,
      searchInput,
      filters,
      filters: { genders, birthdatesRanges, vitalStatuses }
    },
    { changeOrderBy, changeSearchInput, changeSearchBy, addFilters, removeFilter }
  ] = useSearchCriterias(initPatientsSearchCriterias)

  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ genders, vitalStatuses, birthdatesRanges })
  }, [genders, vitalStatuses, birthdatesRanges])

  const controllerRef = useRef<AbortController | null>(null)

  const groupId = getCleanGroupId(searchParams.get('groupId')) ?? undefined

  const fetchPatients = async () => {
    try {
      const includeFacets = false

      setLoadingStatus(LoadingStatus.FETCHING)
      const result = await services.cohorts.fetchPatientList(
        {
          page,
          searchCriterias: {
            orderBy,
            searchInput,
            searchBy,
            filters: { genders, vitalStatuses, birthdatesRanges }
          }
        },
        deidentifiedBoolean ?? true,
        groupId,
        includeFacets,
        controllerRef.current?.signal
      )

      if (result) {
        const { totalPatients, originalPatients } = result
        if (originalPatients) setPatientsList(originalPatients)
        setPatientsResult((ps) => ({ ...ps, nb: totalPatients, label: 'patient(s)' }))
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      }
    }
  }

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [genders, vitalStatuses, birthdatesRanges, orderBy, searchBy, searchInput])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      fetchPatients()
    }
  }, [loadingStatus])

  return (
    <Drawer anchor="right" classes={{ paper: classes.paper }} open={openDrawer} onClose={onClose}>
      <div className={classes.openLeftBar}>
        <IconButton onClick={onClose}>
          <ChevronRight color="action" width="20px" />
        </IconButton>
      </div>
      <BlockWrapper item margin={'4px'}>
        <Searchbar wrapped>
          <Typography variant="button" style={{ marginBottom: '8px' }}>
            Rechercher par :
          </Typography>
          <Grid container item justifyContent="flex-end">
            {!deidentifiedBoolean && (
              <Select
                value={searchBy || SearchByTypes.TEXT}
                label="Rechercher dans :"
                width={'40%'}
                items={searchByListPatients}
                onchange={(newValue: SearchByTypes) => changeSearchBy(newValue)}
              />
            )}
            {deidentifiedBoolean ? (
              <DisplayLocked />
            ) : (
              <SearchInput
                value={searchInput}
                placeholder="Rechercher"
                width="60%"
                onchange={(newValue) => changeSearchInput(newValue)}
              />
            )}
          </Grid>
          <Grid container item alignItems="center" justifyContent="space-between" style={{ marginTop: 4 }}>
            <Button
              width={'45%'}
              startIcon={<FilterList height="15px" fill="#FFF" />}
              onClick={() => setToggleFiltersModal(true)}
            >
              Filtrer
            </Button>
            <Modal
              title="Filtrer les patients"
              open={toggleFiltersModal}
              onClose={() => setToggleFiltersModal(false)}
              onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
            >
              <CheckboxsFilter name={FilterKeys.GENDERS} value={genders} label="Genre :" options={genderOptions} />
              <CheckboxsFilter
                name={FilterKeys.VITAL_STATUSES}
                value={vitalStatuses}
                label="Statut vital :"
                options={vitalStatusesOptions}
              />
              <BirthdatesRangesFilter
                name={FilterKeys.BIRTHDATES}
                value={birthdatesRanges}
                deidentified={deidentifiedBoolean}
              />
            </Modal>

            <Button
              width={'45%'}
              startIcon={<Sort height="15px" fill="#FFF" />}
              onClick={() => setToggleSortModal(true)}
            >
              Trier
            </Button>
            <Modal
              title="Tri des patients"
              open={toggleSortModal}
              onClose={() => setToggleSortModal(false)}
              width="600px"
              onSubmit={(newOrder: OrderBy) => changeOrderBy(newOrder)}
            >
              <Grid container direction="column" justifyContent="space-between" gap="30px">
                <SelectFilter
                  value={orderBy.orderBy || Order.FAMILY}
                  name={OrderByKeys.ORDER_BY}
                  options={deidentifiedBoolean ? orderByListPatientsDeidentified : orderByListPatients}
                />
                <RadioGroupFilter
                  options={orderDirection}
                  value={orderBy.orderDirection || Direction.ASC}
                  name={OrderByKeys.ORDER_DIRECTION}
                  label="Ordre"
                />
              </Grid>
            </Modal>
          </Grid>
        </Searchbar>
      </BlockWrapper>
      <Grid item style={{ margin: '0 4px 4px' }}>
        {filtersAsArray.map((filter, index) => (
          <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
        ))}
      </Grid>
      <Divider />
      <Grid item xs={12}>
        <ListPatient
          loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
          deidentified={deidentifiedBoolean ?? false}
          patientsList={patientsList ?? []}
          page={page}
          setPage={(newPage) => setPage(newPage)}
          total={patientsResult.nb}
          onCloseDrawer={onClose}
        />
      </Grid>
    </Drawer>
  )
}

export default PatientSidebar
