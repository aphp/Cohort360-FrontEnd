import React, { useEffect, useMemo, useRef, useState } from 'react'

import { CircularProgress, Grid } from '@mui/material'
import DataTableImaging from 'components/DataTable/DataTableImaging'
import { PatientTypes } from 'types/patient'
import { LoadingStatus } from 'types'
import DisplayDigits from 'components/ui/Display/DisplayDigits/DisplayDigits'
import { useAppDispatch, useAppSelector } from 'state'
import useSearchCriterias, { initImagingCriterias } from 'hooks/useSearchCriterias'
import { selectFiltersAsArray } from 'utils/filters'
import { fetchImaging } from 'state/patient'
import { CanceledError } from 'axios'
import { _cancelPendingRequest } from 'utils/abortController'

const PatientImaging: React.FC<PatientTypes> = ({ groupId }) => {
  const dispatch = useAppDispatch()
  const { patient } = useAppSelector((state) => ({ patient: state.patient }))
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const searchResults = {
    deidentified: patient?.deidentified || false,
    list: patient?.imaging?.list,
    nb: patient?.imaging?.count ?? 0,
    total: patient?.imaging?.total ?? 0,
    label: 'résultat(s)'
  }

  const [page, setPage] = useState(1)
  const [
    {
      orderBy,
      searchInput,
      filters: { nda, startDate, endDate, executiveUnits }
    },
    dispatchSearchCriteriasAction
  ] = useSearchCriterias(initImagingCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ nda, startDate, endDate, executiveUnits })
  }, [nda, startDate, endDate, executiveUnits])

  const controllerRef = useRef<AbortController | null>(null)

  const _fetchImaging = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchImaging({
          options: {
            page,
            searchCriterias: {
              orderBy,
              searchInput,
              filters: { nda, startDate, endDate, executiveUnits }
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
      }
    }
  }

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [nda, startDate, endDate, executiveUnits, orderBy, searchInput])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = _cancelPendingRequest(controllerRef.current)
      _fetchImaging()
    }
  }, [loadingStatus])

  return (
    <Grid container justifyContent="flex-end">
      <Grid item xs={12}>
        {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && <CircularProgress />}
        {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
          <DisplayDigits nb={searchResults.nb} total={searchResults.total} label={searchResults.label as string} />
        )}
      </Grid>
      <Grid item xs={12}>
        <DataTableImaging
          loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
          deidentified={searchResults.deidentified}
          imagingList={searchResults.list}
          page={page}
          setPage={setPage}
          total={searchResults.total}
        />
      </Grid>
    </Grid>
  )
}

export default PatientImaging
