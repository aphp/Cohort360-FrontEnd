import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CanceledError } from 'axios'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchImaging } from 'state/patient'
import services from 'services/aphp'
import useSearchCriterias, { initImagingCriterias } from 'reducers/searchCriteriasReducer'

import { CircularProgress, Grid } from '@mui/material'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import { BlockWrapper } from 'components/ui/Layout/'
import Button from 'components/ui/Button'
import Chip from 'components/ui/Chip/'
import DataTableImaging from 'components/DataTable/DataTableImaging'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import Modal from 'components/ui/Modal'
import ModalityFilter from 'components/Filters/ModalityFilter/ModalityFilter'
import NdaFilter from 'components/Filters/NdaFilter'
import Searchbar from 'components/ui/Searchbar'
import SearchInput from 'components/ui/Searchbar/SearchInput'

import { cancelPendingRequest } from 'utils/abortController'
import { selectFiltersAsArray } from 'utils/filters'
import { CriteriaName, HierarchyElement, LoadingStatus } from 'types'
import { PatientTypes } from 'types/patient'
import { FilterKeys } from 'types/searchCriterias'
import { AlertWrapper } from 'components/ui/Alert'

const PatientImaging: React.FC<PatientTypes> = ({ groupId }) => {
  const dispatch = useAppDispatch()

  const patient = useAppSelector((state) => state.patient)
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [toggleModal, setToggleModal] = useState(false)
  const [modalitiesList, setModalitiesList] = useState<HierarchyElement[]>([])

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
      filters,
      filters: { nda, startDate, endDate, executiveUnits, modality }
    },
    { changeOrderBy, changeSearchInput, addFilters, removeFilter }
  ] = useSearchCriterias(initImagingCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ nda, startDate, endDate, executiveUnits, modality })
  }, [nda, startDate, endDate, executiveUnits, modality])

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
              filters: { nda, startDate, endDate, executiveUnits, modality }
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
    const _fetchModalities = async () => {
      try {
        const _modalitiesList = await services.cohortCreation.fetchModalities()

        setModalitiesList(_modalitiesList)
      } catch (e) {
        console.error(e)
      }
    }

    _fetchModalities()
  }, [])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [nda, startDate, endDate, orderBy, searchInput, executiveUnits, modality])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      _fetchImaging()
    }
  }, [loadingStatus])

  return (
    <Grid container justifyContent="flex-end">
      <BlockWrapper item xs={12}>
        <AlertWrapper severity="warning">
          Seuls les examens présents dans le PACS Philips et rattachés à un Dossier Administratif (NDA) sont
          actuellement disponibles. Le flux alimentant les métadonnées associées aux séries et aux examens est suspendu
          depuis le 01/02/2023 suite à la migration du PACS AP-HP. Aucun examen produit après cette date n'est
          disponible via cohort360. Pour tout besoin d'examen post 01/02/2023, merci de contacter le support Cohort360 :
          dsn-id-recherche-support-cohort360@aphp.fr.
        </AlertWrapper>
      </BlockWrapper>
      <BlockWrapper item xs={12} margin={'20px 0px 10px 0px'}>
        <Searchbar>
          <Grid container item xs={12} lg={3}>
            {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && (
              <CircularProgress />
            )}
            {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
              <DisplayDigits nb={searchResults.nb} total={searchResults.total} label={searchResults.label as string} />
            )}
          </Grid>

          <Grid container item xs={12} lg={4} justifyContent="flex-end">
            <SearchInput
              value={searchInput}
              placeholder={'Rechercher'}
              width="70%"
              onchange={(newValue: string) => changeSearchInput(newValue)}
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
              <ModalityFilter value={modality} name={FilterKeys.MODALITY} modalitiesList={modalitiesList} />
              <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
              <ExecutiveUnitsFilter
                value={executiveUnits}
                name={FilterKeys.EXECUTIVE_UNITS}
                criteriaName={CriteriaName.Imaging}
              />
            </Modal>
          </Grid>
        </Searchbar>
      </BlockWrapper>
      <Grid item xs={12} margin="0px 0px 10px">
        {filtersAsArray.map((filter, index) => (
          <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
        ))}
      </Grid>

      <Grid item xs={12}>
        <DataTableImaging
          loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
          deidentified={searchResults.deidentified}
          imagingList={searchResults.list}
          orderBy={orderBy}
          setOrderBy={(orderBy) => changeOrderBy(orderBy)}
          page={page}
          setPage={setPage}
          total={searchResults.total}
        />
      </Grid>
    </Grid>
  )
}

export default PatientImaging
