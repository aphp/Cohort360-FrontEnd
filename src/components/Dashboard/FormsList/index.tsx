import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch } from 'state'

import { CircularProgress, Grid, useMediaQuery, useTheme } from '@mui/material'
import { FilterList } from '@mui/icons-material'
import Button from 'components/ui/Button'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import Modal from 'components/ui/Modal'
import { DTTB_ResultsType as ResultsType, LoadingStatus } from 'types'
import { FilterKeys, FormNames, LabelObject } from 'types/searchCriterias'
import { CanceledError } from 'axios'
import services from 'services/aphp'
import useSearchCriterias, { initFormsCriterias } from 'reducers/searchCriteriasReducer'
import { cancelPendingRequest } from 'utils/abortController'
import { selectFiltersAsArray } from 'utils/filters'
import { SourceType } from 'types/scope'
import { Questionnaire } from 'fhir/r4'
import DataTableForms from 'components/DataTable/DataTableForms'
import { useSearchParams } from 'react-router-dom'
import { checkIfPageAvailable, cleanSearchParams, handlePageError } from 'utils/paginationUtils'
import Chip from 'components/ui/Chip'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { getConfig } from 'config'
import TextInput from 'components/Filters/TextInput'
import MultiSelectInput from 'components/Filters/MultiSelectInput'
import labels from 'labels.json'
import CheckboxsFilter from 'components/Filters/CheckboxsFilter'

const formOptions = [
  {
    id: FormNames.PREGNANCY,
    label: labels.formNames.pregnancy
  },
  {
    id: FormNames.HOSPIT,
    label: labels.formNames.hospit
  }
]

const FormsList = () => {
  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = searchParams.get('page')
  const groupId = searchParams.get('groupId') ?? undefined

  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [encounterStatusList, setEncounterStatusList] = useState<LabelObject[]>([])
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [page, setPage] = useState(pageParam ? parseInt(pageParam, 10) : 1)

  const [
    {
      orderBy,
      searchInput,
      filters,
      filters: { formName, startDate, endDate, executiveUnits, encounterStatus, ipp }
    },
    { addFilters, changeOrderBy, removeFilter }
  ] = useSearchCriterias(initFormsCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ formName, startDate, endDate, executiveUnits, encounterStatus, ipp })
  }, [formName, startDate, endDate, executiveUnits, encounterStatus, ipp])

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [searchResults, setSearchResults] = useState<ResultsType>({
    nb: 0,
    total: 0,
    label: 'résultat(s)'
  })
  const [formsList, setFormsList] = useState<any[]>([])
  const [patientsResults, setPatientsResults] = useState<ResultsType>({ nb: 0, total: 0, label: 'patient(s)' })
  const controllerRef = useRef<AbortController | null>(null)
  const isFirstRender = useRef(true)

  const _fetchForms = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await services.cohorts.fetchFormsList(
        {
          page,
          searchCriterias: {
            orderBy,
            searchInput,
            filters: { formName, startDate, endDate, executiveUnits, encounterStatus, ipp }
          }
        },
        groupId,
        controllerRef.current?.signal
      )

      if (response) {
        const { total, totalAllResults, totalPatients, totalAllPatients, list } = response
        setSearchResults((prevState) => ({
          ...prevState,
          nb: total,
          total: totalAllResults
        }))
        setFormsList(list)
        setPatientsResults((prevState) => ({
          ...prevState,
          nb: totalPatients,
          total: totalAllPatients
        }))

        checkIfPageAvailable(total, page, setPage, dispatch)
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      console.error('Erreur lors de la récupération des formulaires', error)
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      } else {
        setLoadingStatus(LoadingStatus.SUCCESS)
        setSearchResults((prevState) => ({
          ...prevState,
          nb: 0,
          total: 0
        }))
        setFormsList([])
        setPatientsResults((prevState) => ({
          ...prevState,
          nb: 0,
          total: 0
        }))
      }
    }
  }

  const fetch = async () => {
    const [_questionnaires, encounterStatus] = await Promise.all([
      services.patients.fetchQuestionnaires(),
      getCodeList(getConfig().core.valueSets.encounterStatus.url)
    ])
    setQuestionnaires(_questionnaires)
    setEncounterStatusList(encounterStatus.results)
  }

  useEffect(() => {
    fetch()
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      setLoadingStatus(LoadingStatus.IDDLE)
      setPage(1)
    }
  }, [orderBy, formName, startDate, endDate, executiveUnits, encounterStatus, ipp, groupId])

  useEffect(() => {
    setSearchParams(cleanSearchParams({ page: page.toString(), groupId: groupId }))

    handlePageError(page, setPage, dispatch, setLoadingStatus)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      _fetchForms()
    }
  }, [loadingStatus])

  return (
    <Grid container justifyContent="flex-end" gap="20px">
      <Grid item xs={12} container alignItems="center" style={isSm ? { flexWrap: 'wrap-reverse', gap: '10px' } : {}}>
        <Grid item xs={12} md={10} container justifyContent={isSm ? 'center' : 'left'}>
          {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && <CircularProgress />}
          {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
            <Grid item xs={12} container justifyContent={isSm ? 'center' : 'left'}>
              <DisplayDigits nb={searchResults.nb} total={searchResults.total} label={searchResults.label as string} />
              <span style={{ width: '25px' }} />
              <DisplayDigits
                nb={patientsResults.nb}
                total={patientsResults.total}
                label={patientsResults.label ?? ''}
              />
            </Grid>
          )}
        </Grid>

        <Grid container item xs={12} md={2}>
          <Button startIcon={<FilterList height="15px" fill="#FFF" />} onClick={() => setToggleFilterByModal(true)}>
            Filtrer
          </Button>
        </Grid>
      </Grid>

      {filtersAsArray.length > 0 && (
        <Grid item xs={12} margin="0px 0px 10px">
          {filtersAsArray.map((filter, index) => (
            <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
          ))}
        </Grid>
      )}

      <Grid item xs={12}>
        <DataTableForms
          loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
          formsList={formsList}
          orderBy={orderBy}
          setOrderBy={(orderBy) => changeOrderBy(orderBy)}
          page={page}
          setPage={setPage}
          total={searchResults.nb}
          groupId={groupId}
          questionnaires={questionnaires}
        />
      </Grid>

      <Modal
        title="Filtrer par :"
        open={toggleFilterByModal}
        width={'600px'}
        onClose={() => setToggleFilterByModal(false)}
        onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
      >
        <TextInput
          name={FilterKeys.IPP}
          value={ipp}
          label="IPP :"
          placeholder="'Exemple: 8000000000001,8000000000002'"
        />
        <CheckboxsFilter name={FilterKeys.FORM_NAME} value={formName} label="Formulaire :" options={formOptions} />
        <ExecutiveUnitsFilter
          sourceType={SourceType.FORM_RESPONSE}
          value={executiveUnits}
          name={FilterKeys.EXECUTIVE_UNITS}
        />
        <MultiSelectInput
          label="Statut de la visite associée :"
          value={encounterStatus}
          name={FilterKeys.ENCOUNTER_STATUS}
          options={encounterStatusList}
        />
      </Modal>
    </Grid>
  )
}

export default FormsList
