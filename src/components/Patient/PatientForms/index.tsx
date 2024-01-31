import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, DialogContent, Grid } from '@mui/material'
import { useAppDispatch, useAppSelector } from 'state'
import { CohortQuestionnaireResponse, LoadingStatus } from 'types'
import useSearchCriterias from 'reducers/searchCriteriasReducer'
import { selectFiltersAsArray } from 'utils/filters'
import { CanceledError } from 'axios'
import Select from 'components/ui/Searchbar/Select'
import { cancelPendingRequest } from 'utils/abortController'
import { FormsFilters, OrderByKeys, SearchCriterias } from 'types/searchCriterias'
import { fetchForms } from 'state/patient'
import Button from 'components/ui/Button'
import { pregnancyForm } from 'data/pregnancyData'
import { QuestionnaireResponseItemAnswer } from 'fhir/r4'

type PatientFormsProps = {
  groupId?: string
}

const forms = [
  {
    id: 'maternity',
    label: 'Maternité'
  }
]

const PatientForms = ({ groupId }: PatientFormsProps) => {
  const dispatch = useAppDispatch()
  const patient = useAppSelector((state) => state.patient)
  const [form, setForm] = useState('maternity')
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const searchResults = { list: patient?.forms?.list }
  const [page, setPage] = useState(1)
  const [togglePregnancyDetails, setTogglePregnancyDetails] = useState<CohortQuestionnaireResponse | undefined>(
    undefined
  )
  //   const [
  //     {
  //       filters,
  //       filters: {}
  //     },
  //     { addFilters, removeFilter }
  //   ] = useSearchCriterias(initFormsSearchCriterias)
  //   const filtersAsArray = useMemo(() => {
  //     return selectFiltersAsArray({})
  //   }, [])

  const controllerRef = useRef<AbortController | null>(null)

  const _fetchForms = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchForms({
          options: {
            page,
            searchCriterias: {
              orderBy: 'name',
              searchInput: '',
              filters: { formName: 'pregnancy' }
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

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      _fetchForms()
    }
  }, [loadingStatus])

  const getDataFromForm = (
    form: CohortQuestionnaireResponse,
    pregnancyDataName: { id: string; type: keyof QuestionnaireResponseItemAnswer }
  ) => {
    console.log('pregnancyDataName.type', pregnancyDataName.type)
    console.log('form', form.item?.find((item) => item.linkId === pregnancyDataName.id)?.answer?.[0]?.valueString)
    console.log(
      'form que jai implem',
      form.item?.find((item) => item.linkId === pregnancyDataName.id)?.answer?.[0]?.[pregnancyDataName.type]
    )

    switch (pregnancyDataName.type) {
      case value:
        break

      default:
        break
    }

    return (
      form.item
        ?.find((item) => item.linkId === pregnancyDataName.id)
        ?.answer?.[0]?.[pregnancyDataName.type]?.toString() ?? ''
    )
  }

  return (
    <Grid container justifyContent="flex-end">
      <Select selectedValue={form} label="Formulaire" items={forms} onchange={(newValue) => setForm(newValue)} />
      {searchResults.list?.map((form, index) => (
        <Grid container item key={index}>
          <Grid container item xs={4} justifyContent="column">
            <p> {form.item?.find((item) => item.linkId === 'F_MATER_001024')?.answer?.[0].valueString}</p>
            <p> {getDataFromForm(form, pregnancyForm.foetus)} </p>
            <p>Date de début de grossesse : {getDataFromForm(form, pregnancyForm.startDate)}</p>
            <p>Unité exécutrice à compléter</p>
            <Button onClick={() => setTogglePregnancyDetails(form)}>+ de détails</Button>
          </Grid>
          <Grid container item xs={8}>
            {form.hospitLinked?.map((hospit, index) => (
              <Grid container item key={index}>
                <p>Unité exécutrice à compléter</p>
                {/* Du {getDataFromForm(hospit, pregnancyForm.startDate)} au{' '}
                {getDataFromForm(hospit, pregnancyForm.endDate)} */}
              </Grid>
            ))}
          </Grid>
        </Grid>
      ))}
      {togglePregnancyDetails && (
        <Dialog open>
          <DialogContent>
            Nombre de foetus: Type de grossesse: Type de grossesse gémellaire: Parité: Risques liés aux antécédents
            maternels: Suivi échographique - Précision : Risques ou complications de la grossesse : Grossesse suivie au
            diagnostic prénatal :
          </DialogContent>
        </Dialog>
      )}
    </Grid>
  )
}

export default PatientForms
