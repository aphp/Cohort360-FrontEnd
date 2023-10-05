import React, { useEffect, useMemo, useRef, useState } from 'react'

import { CircularProgress, Grid, useMediaQuery, useTheme } from '@mui/material'
import Chip from 'components/ui/Chips/Chip'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import DataTablePmsi from 'components/DataTable/DataTablePmsi'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchPmsi } from 'state/patient'

import { LoadingStatus, TabType } from 'types'

import useStyles from './styles'
import { _cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import Searchbar from 'components/ui/Searchbar'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import Tabs from 'components/ui/Tabs'
import { FilterKeys } from 'types/searchCriterias'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import { mapToCriteriaName } from 'utils/mappers'
import { PMSI, PMSILabel } from 'types/patient'
import { selectFiltersAsArray } from 'utils/filters'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter/DatesRangeFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter/ExecutiveUnitsFilter'
import NdaFilter from 'components/Filters/NdaFilter/NdaFilter'
import CodeFilter from 'components/Filters/CodeFilter/CodeFilter'
import DiagnosticTypesFilter from 'components/Filters/DiagnosticTypesFilter/DiagnosticTypesFilter'
import { BlockWrapper } from 'components/ui/Layout'
import useSearchCriterias, { initPmsiSearchCriterias } from 'reducers/searchCriteriasReducer'
import services from 'services/aphp'

export type PatientPMSIProps = {
  groupId?: string
}

const PatientPMSI = ({ groupId }: PatientPMSIProps) => {
  const { classes } = useStyles()
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.between('sm', 'lg'))
  const isSm = useMediaQuery(theme.breakpoints.down('md'))
  const [toggleModal, setToggleModal] = useState(false)
  const dispatch = useAppDispatch()

  const [selectedTab, setSelectedTab] = useState<TabType<PMSI, PMSILabel>>({
    id: PMSI.DIAGNOSTIC,
    label: PMSILabel.DIAGNOSTIC
  })
  const PMSITabs: TabType<PMSI, PMSILabel>[] = [
    { label: PMSILabel.DIAGNOSTIC, id: PMSI.DIAGNOSTIC },
    { label: PMSILabel.CCAM, id: PMSI.CCAM },
    { label: PMSILabel.GMH, id: PMSI.GMH }
  ]
  const [page, setPage] = useState(1)

  const [
    {
      orderBy,
      searchInput,
      filters,
      filters: { code, nda, diagnosticTypes, startDate, endDate, executiveUnits }
    },
    { changeOrderBy, changeSearchInput, addFilters, removeFilter, removeSearchCriterias }
  ] = useSearchCriterias(initPmsiSearchCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ code, nda, diagnosticTypes, startDate, endDate, executiveUnits })
  }, [code, nda, diagnosticTypes, startDate, endDate, executiveUnits])

  const [allDiagnosticTypesList, setAllDiagnosticTypesList] = useState<string[]>([])
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)

  /* TODO => enlever l'appel de redux */
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))
  const searchResults = {
    deidentified: patient?.deidentified || false,
    list: patient?.pmsi?.[selectedTab.id]?.list || [],
    nb: patient?.pmsi?.[selectedTab.id]?.count ?? 0,
    total: patient?.pmsi?.[selectedTab.id]?.total ?? 0,
    label: selectedTab.id === PMSI.DIAGNOSTIC ? 'diagnostic(s)' : selectedTab.id === PMSI.CCAM ? PMSI.CCAM : 'ghm'
  }
  const controllerRef = useRef<AbortController | null>(null)

  const _fetchPMSI = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchPmsi({
          options: {
            selectedTab: selectedTab.id,
            page,
            searchCriterias: {
              orderBy,
              searchInput,
              filters: { code, nda, diagnosticTypes, startDate, endDate, executiveUnits }
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
    const _fetchDiagnosticTypes = async () => {
      try {
        const diagnosticTypes = await services.cohortCreation.fetchDiagnosticTypes()
        setAllDiagnosticTypesList(diagnosticTypes)
      } catch (e) {
        /* empty */
      }
    }
    _fetchDiagnosticTypes()
  }, [])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [searchInput, nda, code, startDate, endDate, diagnosticTypes, orderBy, executiveUnits])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = _cancelPendingRequest(controllerRef.current)
      _fetchPMSI()
    }
  }, [loadingStatus])

  useEffect(() => {
    setPage(1)
    removeSearchCriterias()
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [selectedTab])

  return (
    <Grid container justifyContent="flex-end" className={classes.documentTable}>
      <BlockWrapper item xs={12} margin={'20px 0px 10px 0px'}>
        <Searchbar>
          <Grid container item xs={12} md={12} lg={8} xl={8} style={isSm ? { flexWrap: 'wrap-reverse' } : {}}>
            <Grid item xs={12} md={6} lg={6} xl={6}>
              <Tabs
                values={PMSITabs}
                active={selectedTab}
                onchange={(value: TabType<PMSI, PMSILabel>) => setSelectedTab(value)}
              />
            </Grid>
            <Grid
              container
              justifyContent={isSm ? 'flex-start' : isMd ? 'flex-end' : 'center'}
              alignItems="center"
              item
              xs={12}
              md={6}
              lg={6}
              xl={6}
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
              onchange={(newValue) => changeSearchInput(newValue)}
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
              <CodeFilter name={FilterKeys.CODE} value={code} />
              {selectedTab.id === PMSI.DIAGNOSTIC && (
                <DiagnosticTypesFilter
                  name={FilterKeys.DIAGNOSTIC_TYPES}
                  value={diagnosticTypes}
                  allDiagnosticTypesList={allDiagnosticTypesList}
                />
              )}
              <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
              <ExecutiveUnitsFilter
                value={executiveUnits}
                name={FilterKeys.EXECUTIVE_UNITS}
                criteriaName={mapToCriteriaName(selectedTab.id)}
              />
            </Modal>
          </Grid>
        </Searchbar>
      </BlockWrapper>
      <Grid item xs={12} container marginBottom={2}>
        {filtersAsArray.map((filter, index) => (
          <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
        ))}
      </Grid>
      <Grid item xs={12}>
        <DataTablePmsi
          loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
          selectedTab={selectedTab.id}
          pmsiList={searchResults.list}
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
export default PatientPMSI
