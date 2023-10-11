import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import moment from 'moment/moment'

import { Divider, Drawer, Grid, IconButton, Typography } from '@mui/material'
import { ChevronRight, Sort } from '@mui/icons-material'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import { substructAgeString } from 'utils/age'
import { selectFiltersAsArray } from 'utils/filters'
import { _cancelPendingRequest } from 'utils/abortController'
import services from 'services/aphp'
import { CohortPatient, DTTB_ResultsType as ResultsType, LoadingStatus } from 'types'

import {
  Direction,
  FilterKeys,
  Order,
  OrderBy,
  OrderByKeys,
  SearchByTypes,
  orderByListPatients,
  orderByListPatientsDeidentified,
  searchByListPatients
} from 'types/searchCriterias'

import GendersFilter from 'components/Filters/GendersFilter/GenderFilter'

import Button from 'components/ui/Button'
import Chip from 'components/ui/Chips/Chip'
import { BlockWrapper } from 'components/ui/Layout'
import Modal from 'components/ui/Modal'
import Searchbar from 'components/ui/Searchbar'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Select from 'components/ui/Searchbar/Select'

import VitalStatusesFilter from 'components/Filters/VitalStatusesFilter/VitalStatusesFilter'
import BirthdatesRangesFilter from 'components/Filters/BirthdatesRangesFilters/BirthdatesRangesFilter'

import { CanceledError } from 'axios'

import useStyles from './styles'
import ListPatient from 'components/DataTable/ListPatient'
import OrderByFilter from 'components/Filters/OrderByFilter/OrderByFilter'
import OrderDirectionFilter from 'components/Filters/OrderDirectionFilter/OrderDirectionFilter'
import DisplayLocked from 'components/ui/Display/DisplayLocked'
import useSearchCriterias, { initPatientsSearchCriterias } from 'reducers/searchCriteriasReducer'

type PatientSidebarTypes = {
  total: number
  patients?: CohortPatient[]
  openDrawer: boolean
  onClose: () => void
  deidentifiedBoolean: boolean
}

const PatientSidebar: React.FC<PatientSidebarTypes> = ({
  total,
  patients,
  openDrawer,
  onClose,
  deidentifiedBoolean
}) => {
  const { classes } = useStyles()
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

  const location = useLocation()
  const { search } = location
  const groupId = new URLSearchParams(search).get('groupId') ?? ''

  const fetchPatients = async () => {
    try {
      const includeFacets = false
      const birthdates: [string, string] = [
        moment(substructAgeString(filters.birthdatesRanges[0] || '')).format('MM/DD/YYYY'),
        moment(substructAgeString(filters.birthdatesRanges[1] || '')).format('MM/DD/YYYY')
      ]

      setLoadingStatus(LoadingStatus.FETCHING)
      const result = await services.cohorts.fetchPatientList(
        {
          page,
          searchCriterias: {
            orderBy,
            searchInput,
            searchBy,
            filters: { genders, vitalStatuses, birthdatesRanges: birthdates }
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
      controllerRef.current = _cancelPendingRequest(controllerRef.current)
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
        <Searchbar wrap>
          <Typography variant="button" style={{ marginBottom: '8px' }}>
            Rechercher par :
          </Typography>
          <Grid container item justifyContent="flex-end">
            {!deidentifiedBoolean && (
              <Select
                selectedValue={searchBy || SearchByTypes.TEXT}
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
          <Grid container item alignItems="center" justifyContent="space-between">
            <Button
              width={'45%'}
              icon={<FilterList height="15px" fill="#FFF" />}
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
              <GendersFilter name={FilterKeys.GENDERS} value={genders} />
              <VitalStatusesFilter name={FilterKeys.VITAL_STATUSES} value={vitalStatuses} />
              <BirthdatesRangesFilter name={FilterKeys.BIRTHDATES} value={birthdatesRanges} />
            </Modal>

            <Button width={'45%'} icon={<Sort height="15px" fill="#FFF" />} onClick={() => setToggleSortModal(true)}>
              Trier
            </Button>
            <Modal
              title="Tri des patients"
              open={toggleSortModal}
              onClose={() => setToggleSortModal(false)}
              width="600px"
              onSubmit={(newOrder: OrderBy) => changeOrderBy(newOrder)}
            >
              <Grid container direction="row" justifyContent="space-between" alignItems="center">
                <OrderByFilter
                  orderByValue={orderBy.orderBy || Order.LASTNAME}
                  name={OrderByKeys.ORDER_BY}
                  items={deidentifiedBoolean ? orderByListPatientsDeidentified : orderByListPatients}
                />
                <OrderDirectionFilter
                  orderDirectionValue={orderBy.orderDirection || Direction.ASC}
                  name={OrderByKeys.ORDER_DIRECTION}
                />
              </Grid>
            </Modal>
          </Grid>
        </Searchbar>
      </BlockWrapper>
      <Grid item style={{ margin: '0 4px' }}>
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
