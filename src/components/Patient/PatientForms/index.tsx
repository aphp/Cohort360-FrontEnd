import React, { useEffect, useMemo, useRef, useState } from 'react'
import moment from 'moment'
import { useAppDispatch, useAppSelector } from 'state'
import { Grid, useMediaQuery, useTheme } from '@mui/material'
import { FilterList } from '@mui/icons-material'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import MaternityFormFilter from 'components/Filters/MaternityFormFilter'
import Button from 'components/ui/Button'
import Chip from 'components/ui/Chip'
import { BlockWrapper } from 'components/ui/Layout'
import Modal from 'components/ui/Modal'
import Searchbar from 'components/ui/Searchbar'
import Select from 'components/ui/Searchbar/Select'
import useSearchCriterias, { initFormsCriterias } from 'reducers/searchCriteriasReducer'
import { CanceledError } from 'axios'
import { fetchForms } from 'state/patient'
import { pregnancyForm } from 'data/pregnancyData'
import PregnancyFormDetails from './PregnancyFormDetails'
import HospitFormDetails from './HospitFormDetails'
import { cancelPendingRequest } from 'utils/abortController'
import { selectFiltersAsArray } from 'utils/filters'
import { getDataFromForm } from 'utils/formUtils'
import { QuestionnaireResponse } from 'fhir/r4'
import { CriteriaName, LoadingStatus } from 'types'
import { FilterKeys } from 'types/searchCriterias'

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
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.between('sm', 'lg'))
  const isSm = useMediaQuery(theme.breakpoints.down('md'))
  const [toggleModal, setToggleModal] = useState(false)

  const dispatch = useAppDispatch()
  const patient = useAppSelector((state) => state.patient)
  const [form, setForm] = useState('maternity')
  const [togglePregnancyDetails, setTogglePregnancyDetails] = useState<QuestionnaireResponse | undefined>(undefined)
  const [toggleHospitDetails, setToggleHospitDetails] = useState<QuestionnaireResponse | undefined>(undefined)

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
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
    pregnancyFormList: patient?.forms?.pregnancyFormList,
    hospitFormList: patient?.forms?.hospitFormList
  }

  const controllerRef = useRef<AbortController | null>(null)

  const _fetchForms = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchForms({
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

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
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
      <BlockWrapper item xs={12} margin={'20px 0px 10px'}>
        <Searchbar>
          <Grid container item xs={12} md={12} lg={8} xl={8} style={isSm ? { flexWrap: 'wrap-reverse' } : {}}>
            <Grid
              container
              justifyContent={isSm ? 'flex-start' : isMd ? 'flex-end' : 'center'}
              alignItems="end"
              item
              xs={12}
              md={7}
              lg={7}
              xl={7}
              style={isSm ? { marginBottom: 20 } : {}}
            >
              <Select value={form} label="Formulaire" items={forms} onchange={(newValue) => setForm(newValue)} />
            </Grid>
          </Grid>

          <Grid container item xs={12} md={12} lg={4} xl={4} justifyContent="flex-end">
            <Button width={'30%'} icon={<FilterList height="15px" fill="#FFF" />} onClick={() => setToggleModal(true)}>
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
      {searchResults.pregnancyFormList?.map((form, index) => (
        <Grid container item key={index}>
          <Grid container item xs={4} justifyContent="column">
            <p> {getDataFromForm(form, pregnancyForm.pregnancyType)} </p>
            <p>Début de grossesse : {moment(getDataFromForm(form, pregnancyForm.startDate)).format('DD/MM/YYYY')}</p>
            <p>Unité exécutrice à compléter</p>
            <Button onClick={() => setTogglePregnancyDetails(form)}>+ de détails</Button>
          </Grid>
          <Grid container item xs={8}>
            {/* {form.hospitLinked?.map((hospit, index) => (
              <Grid container item key={index}>
                <p>Unité exécutrice à compléter</p>
                <Button onClick={() => setToggleHospitDetails(hospit)}>+ de détails</Button>
              </Grid>
            ))} */}
          </Grid>
        </Grid>
      ))}
      {togglePregnancyDetails && (
        <PregnancyFormDetails
          pregnancyFormData={togglePregnancyDetails}
          onClose={() => setTogglePregnancyDetails(undefined)}
        />
      )}
      {toggleHospitDetails && (
        <HospitFormDetails hospitFormData={toggleHospitDetails} onClose={() => setToggleHospitDetails(undefined)} />
      )}
    </Grid>
  )
}

export default PatientForms
