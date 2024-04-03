import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'state'
import { Grid } from '@mui/material'
import { FilterList } from '@mui/icons-material'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import MaternityFormFilter from 'components/Filters/MaternityFormFilter'
import Button from 'components/ui/Button'
import Chip from 'components/ui/Chip'
import { BlockWrapper } from 'components/ui/Layout'
import Modal from 'components/ui/Modal'
import Searchbar from 'components/ui/Searchbar'
import useSearchCriterias, { initFormsCriterias } from 'reducers/searchCriteriasReducer'
import { CanceledError } from 'axios'
import { fetchMaternityForms } from 'state/patient'
import { cancelPendingRequest } from 'utils/abortController'
import { selectFiltersAsArray } from 'utils/filters'
import { Questionnaire } from 'fhir/r4'
import { CriteriaName, LoadingStatus } from 'types'
import { FilterKeys } from 'types/searchCriterias'
import Timeline from './Timeline'
import services from 'services/aphp'

type PatientFormsProps = {
  groupId?: string
}

const MaternityForm = ({ groupId }: PatientFormsProps) => {
  const [toggleModal, setToggleModal] = useState(false)

  const dispatch = useAppDispatch()
  const patient = useAppSelector((state) => state.patient)

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [maternityFormNamesIds, setMaternityFormNamesIds] = useState<Questionnaire[]>([])
  const [
    {
      filters,
      filters: { formName, startDate, endDate, executiveUnits }
    },
    { addFilters, removeFilter }
  ] = useSearchCriterias(initFormsCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ formName, startDate, endDate, executiveUnits })
  }, [formName, startDate, endDate, executiveUnits])

  const searchResults = {
    maternityFormList: patient?.forms?.maternityForms?.maternityFormsList
  }

  const controllerRef = useRef<AbortController | null>(null)

  const _fetchForms = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchMaternityForms({
          options: {
            searchCriterias: {
              filters: { formName, startDate, endDate, executiveUnits }
            }
          },
          groupId: groupId
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
        setLoadingStatus(LoadingStatus.IDDLE)
      }
    }
  }

  const _fetchMaternityFormNamesIds = async () => {
    const maternityFormNamesIds = await services.patients.fetchMaternityFormNamesIds()
    setMaternityFormNamesIds(maternityFormNamesIds)
  }

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    _fetchMaternityFormNamesIds()
  }, [])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [formName, startDate, endDate, executiveUnits])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      _fetchForms()
    }
  }, [loadingStatus])

  return (
    <Grid container justifyContent="flex-end">
      <BlockWrapper item xs={12} margin={'20px 0px 0px'}>
        <Searchbar>
          <Grid container item xs={12} justifyContent="flex-end">
            <Button width={'10%'} icon={<FilterList height="15px" fill="#FFF" />} onClick={() => setToggleModal(true)}>
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
                <MaternityFormFilter name={FilterKeys.FORM_NAME} value={formName} />
                <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
                <ExecutiveUnitsFilter
                  value={executiveUnits}
                  name={FilterKeys.EXECUTIVE_UNITS}
                  criteriaName={CriteriaName.Form}
                />
              </Modal>
            )}
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
        <Timeline
          loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
          questionnaireResponses={searchResults.maternityFormList ?? []}
          maternityFormNamesIds={maternityFormNamesIds}
        />
      </Grid>
    </Grid>
  )
}

export default MaternityForm
