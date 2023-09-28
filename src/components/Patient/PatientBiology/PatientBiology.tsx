import React, { useEffect, useMemo, useRef, useState } from 'react'

import { Checkbox, CircularProgress, Grid, Typography } from '@mui/material'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import DataTableObservation from 'components/DataTable/DataTableObservation'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchBiology } from 'state/patient'
import { CriteriaName, LoadingStatus } from 'types'

import useStyles from './styles'
import { _cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import DisplayDigits from 'components/ui/Display/DisplayDigits/DisplayDigits'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Searchbar from 'components/ui/Searchbar/Searchbar'
import { ActionTypes, FilterKeys } from 'types/searchCriterias'
import useSearchCriterias, { initBioSearchCriterias } from 'hooks/useSearchCriterias'
import { selectFiltersAsArray } from 'utils/filters'
import { PatientTypes } from 'types/patient'
import Button from 'components/ui/Button/Button'
import Modal from 'components/ui/Modal/Modal'
import Chip from 'components/ui/Chips/Chip'
import NdaFilter from 'components/Filters/NdaFilter/NdaFilter'
import AnabioFilter from 'components/Filters/AnabioFilter/AnabioFilter'
import LoincFilter from 'components/Filters/LoincFilter/LoincFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter/ExecutiveUnitsFilter'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter/DatesRangeFilter'
import { BlockWrapper } from 'components/ui/Layout/styles'
import { AlertWrapper } from 'components/ui/Alert/styles'

const PatientBiology: React.FC<PatientTypes> = ({ groupId }) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))
  const [toggleModal, setToggleModal] = useState(false)

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const searchResults = {
    deidentified: patient?.deidentified || false,
    list: patient?.biology?.list ?? [],
    nb: patient?.biology?.count ?? 0,
    total: patient?.biology?.total ?? 0,
    label: 'résultat(s)'
  }

  const [page, setPage] = useState(1)
  const [
    {
      orderBy,
      searchInput,
      filters,
      filters: { nda, loinc, anabio, startDate, endDate, executiveUnits, validatedStatus }
    },
    dispatchSearchCriteriasAction
  ] = useSearchCriterias(initBioSearchCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ nda, validatedStatus, loinc, anabio, startDate, endDate, executiveUnits })
  }, [nda, loinc, anabio, startDate, endDate, executiveUnits])

  const controllerRef = useRef<AbortController | null>(null)

  const _fetchBiology = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchBiology({
          options: {
            page,
            searchCriterias: {
              orderBy,
              searchInput,
              filters: { validatedStatus, nda, loinc, anabio, startDate, endDate, executiveUnits }
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
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [nda, loinc, anabio, startDate, endDate, executiveUnits, validatedStatus, orderBy, searchInput])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = _cancelPendingRequest(controllerRef.current)
      _fetchBiology()
    }
  }, [loadingStatus])

  return (
    <Grid container justifyContent="flex-end" className={classes.documentTable}>
      <BlockWrapper item xs={12}>
        <AlertWrapper severity="warning">
          Les mesures de biologie sont pour l'instant restreintes aux 3870 codes ANABIO correspondants aux analyses les
          plus utilisées au niveau national et à l'AP-HP. De plus, les résultats concernent uniquement les analyses
          quantitatives enregistrées sur GLIMS, qui ont été validées et mises à jour depuis mars 2020.
        </AlertWrapper>
      </BlockWrapper>

      <Grid item xs={12}>
        <Grid container item xs={12} alignItems="center" justifyContent="flex-end">
          <Checkbox checked={validatedStatus} disabled />
          <Typography style={{ color: '#505050' }}>
            N'afficher que les analyses dont les résultats ont été validés
          </Typography>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Searchbar>
          <Grid item xs={12} lg={3}>
            {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && (
              <CircularProgress />
            )}
            {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
              <DisplayDigits nb={searchResults.nb} total={searchResults.total} label={searchResults.label as string} />
            )}
          </Grid>
          <Grid container item xs={12} lg={9} justifyContent="flex-end" style={{ maxWidth: 900 }}>
            <SearchInput
              value={searchInput}
              placeholder="Rechercher"
              width={'70%'}
              onchange={(newValue) =>
                dispatchSearchCriteriasAction({ type: ActionTypes.CHANGE_SEARCH_INPUT, payload: newValue })
              }
            />
            <Button width={'25%'} icon={<FilterList height="15px" fill="#FFF" />} onClick={() => setToggleModal(true)}>
              Filtrer
            </Button>
            <Modal
              title="Filtrer par :"
              open={toggleModal}
              width={'600px'}
              onClose={() => setToggleModal(false)}
              onSubmit={(newFilters) => {
                dispatchSearchCriteriasAction({ type: ActionTypes.ADD_FILTERS, payload: { ...filters, ...newFilters } })
              }}
            >
              {!searchResults.deidentified && <NdaFilter name={FilterKeys.NDA} value={nda} />}
              <AnabioFilter name={FilterKeys.ANABIO} value={anabio} />
              <LoincFilter name={FilterKeys.LOINC} value={loinc} />
              <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
              <ExecutiveUnitsFilter
                value={executiveUnits}
                name={FilterKeys.EXECUTIVE_UNITS}
                criteriaName={CriteriaName.Biology}
              />
            </Modal>
          </Grid>
        </Searchbar>
      </Grid>

      <Grid item xs={12}>
        {filtersAsArray.map((filter, index) => (
          <Chip
            key={index}
            label={filter.label}
            onDelete={() => {
              dispatchSearchCriteriasAction({
                type: ActionTypes.REMOVE_FILTER,
                payload: { key: filter.category, value: filter.value }
              })
            }}
          />
        ))}
      </Grid>

      <Grid item xs={12}>
        <DataTableObservation
          loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
          deidentified={searchResults.deidentified}
          observationsList={searchResults.list}
          orderBy={orderBy}
          setOrderBy={(orderBy) =>
            dispatchSearchCriteriasAction({ type: ActionTypes.CHANGE_ORDER_BY, payload: orderBy })
          }
          page={page}
          setPage={(newPage) => setPage(newPage)}
          total={searchResults.total}
        />
      </Grid>
    </Grid>
  )
}

export default PatientBiology
