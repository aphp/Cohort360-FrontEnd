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
import { LoadingStatus } from 'types'
import { FilterKeys } from 'types/searchCriterias'
import Timeline from './Timeline'
import services from 'services/aphp'
import EncounterStatusFilter from 'components/Filters/EncounterStatusFilter'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'
import { useSearchParams } from 'react-router-dom'
import { getCleanGroupId } from 'utils/paginationUtils'

const MaternityForm = () => {
  const [toggleModal, setToggleModal] = useState(false)

  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const patient = useAppSelector((state) => state.patient)
  const groupId = searchParams.get('groupId') ?? undefined

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [encounterStatusList, setEncounterStatusList] = useState<Hierarchy<any, any>[]>([])

  const [
    {
      filters,
      filters: { formName, startDate, endDate, executiveUnits, encounterStatus }
    },
    { addFilters, removeFilter }
  ] = useSearchCriterias(initFormsCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ formName, startDate, endDate, executiveUnits, encounterStatus })
  }, [formName, startDate, endDate, executiveUnits, encounterStatus])

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
              filters: { formName, startDate, endDate, executiveUnits, encounterStatus }
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

  const fetch = async () => {
    const [_questionnaires, encounterStatus] = await Promise.all([
      services.patients.fetchQuestionnaires(),
      services.cohortCreation.fetchEncounterStatus()
    ])
    setQuestionnaires(_questionnaires)
    setEncounterStatusList(encounterStatus)
  }

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setSearchParams({ ...(groupId && getCleanGroupId(groupId) && { groupId: getCleanGroupId(groupId) }) })

    fetch()
  }, [])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [formName, startDate, endDate, executiveUnits, encounterStatus])

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
                  sourceType={SourceType.FORM_RESPONSE}
                  value={executiveUnits}
                  name={FilterKeys.EXECUTIVE_UNITS}
                />
                <EncounterStatusFilter
                  value={encounterStatus}
                  name={FilterKeys.ENCOUNTER_STATUS}
                  encounterStatusList={encounterStatusList}
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
          questionnaires={questionnaires}
        />
      </Grid>
    </Grid>
  )
}

export default MaternityForm
