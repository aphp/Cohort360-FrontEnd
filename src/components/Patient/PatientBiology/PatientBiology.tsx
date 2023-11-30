import React, { useEffect, useMemo, useRef, useState } from 'react'

import { Checkbox, CircularProgress, Grid, Typography } from '@mui/material'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import DataTableObservation from 'components/DataTable/DataTableObservation'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchBiology } from 'state/patient'
import { CriteriaName, LoadingStatus } from 'types'

import useStyles from './styles'
import { cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Searchbar from 'components/ui/Searchbar'
import { FilterKeys } from 'types/searchCriterias'
import { selectFiltersAsArray } from 'utils/filters'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import { BlockWrapper } from 'components/ui/Layout'
import useSearchCriterias, { initBioSearchCriterias } from 'reducers/searchCriteriasReducer'
import Chip from 'components/ui/Chip'
import { AlertWrapper } from 'components/ui/Alert'
import AnabioFilter from 'components/Filters/AnabioFilter'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import LoincFilter from 'components/Filters/LoincFilter'
import NdaFilter from 'components/Filters/NdaFilter'

type PatientBiologyProps = {
  groupId?: string
}

const PatientBiology = ({ groupId }: PatientBiologyProps) => {
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
    { changeOrderBy, changeSearchInput, addFilters, removeFilter }
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
      controllerRef.current = cancelPendingRequest(controllerRef.current)
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
      <Grid item xs={12} margin={'10px 0px'}>
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
              onchange={(newValue) => changeSearchInput(newValue)}
            />
            <Button width={'25%'} icon={<FilterList height="15px" fill="#FFF" />} onClick={() => setToggleModal(true)}>
              Filtrer
            </Button>
            {toggleModal && (
              <Modal
                title="Filtrer par :"
                open={toggleModal}
                width={'600px'}
                onClose={() => setToggleModal(false)}
                onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
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
            )}
          </Grid>
        </Searchbar>
      </Grid>
      {filtersAsArray.length > 0 && (
        <Grid item xs={12} margin="0px 0px 10px">
          {filtersAsArray.map((filter, index) => (
            <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
          ))}
        </Grid>
      )}

      <Grid item xs={12}>
        <DataTableObservation
          loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
          deidentified={searchResults.deidentified}
          observationsList={searchResults.list}
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

export default PatientBiology
