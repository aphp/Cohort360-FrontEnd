import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CanceledError } from 'axios'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchImaging } from 'state/patient'
import useSearchCriterias, { initImagingCriterias } from 'reducers/searchCriteriasReducer'

import { CircularProgress, Grid, Tooltip } from '@mui/material'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import Button from 'components/ui/Button'
import Chip from 'components/ui/Chip/'
import DataTableImaging from 'components/DataTable/DataTableImaging'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import Modal from 'components/ui/Modal'
import ModalityFilter from 'components/Filters/ModalityFilter/ModalityFilter'
import NdaFilter from 'components/Filters/NdaFilter'
import SearchInput from 'components/ui/Searchbar/SearchInput'

import { cancelPendingRequest } from 'utils/abortController'
import { selectFiltersAsArray } from 'utils/filters'
import { CriteriaName, HierarchyElement, LoadingStatus } from 'types'
import { PatientTypes } from 'types/patient'
import { Direction, FilterKeys, ImagingFilters, Order } from 'types/searchCriterias'
import { RessourceType } from 'types/requestCriterias'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { Save, SavedSearch } from '@mui/icons-material'
import TextInput from 'components/ui/TextInput'
import List from 'components/ui/List'
import { fetchModalities } from 'services/aphp/serviceImaging'

const PatientImaging: React.FC<PatientTypes> = ({ groupId }) => {
  const dispatch = useAppDispatch()

  const patient = useAppSelector((state) => state.patient)
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
  const [allModalities, setAllModalities] = useState<HierarchyElement[]>([])

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
    { changeOrderBy, changeSearchInput, addFilters, removeFilter, addSearchCriterias }
  ] = useSearchCriterias(initImagingCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ nda, startDate, endDate, executiveUnits, modality })
  }, [nda, startDate, endDate, executiveUnits, modality])
  const {
    allSavedFilters,
    savedFiltersErrors,
    selectedSavedFilter,
    allSavedFiltersAsListItems,
    methods: {
      getSavedFilters,
      postSavedFilter,
      deleteSavedFilters,
      patchSavedFilter,
      selectFilter,
      resetSavedFilterError
    }
  } = useSavedFilters<ImagingFilters>(RessourceType.IMAGING)

  const controllerRef = useRef<AbortController | null>(null)

  const meState = useAppSelector((state) => state.me)
  const maintenanceIsActive = meState?.maintenance?.active

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
    const fetch = async () => {
      const modalities = await fetchModalities()
      setAllModalities(modalities)
    }
    fetch()
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

  const SaveFiltersButton = () => (
    <Button
      width="250px"
      icon={<Save height="15px" fill="#FFF" />}
      onClick={() => {
        setToggleSaveFiltersModal(true)
        resetSavedFilterError()
      }}
      color="secondary"
      disabled={maintenanceIsActive}
    >
      Enregistrer filtres
    </Button>
  )

  return (
    <Grid container justifyContent="flex-end" gap="20px">
      <Grid container justifyContent="flex-end" gap="10px">
        {(filtersAsArray.length > 0 || searchInput) && (
          <Grid item>
            {maintenanceIsActive ? (
              <Tooltip
                title="Ce bouton est désactivé en raison d'une maintenance en cours."
                arrow
                placement="bottom-start"
              >
                <Grid>
                  <SaveFiltersButton />
                </Grid>
              </Tooltip>
            ) : (
              <SaveFiltersButton />
            )}
          </Grid>
        )}

        {!!allSavedFilters?.count && (
          <Grid item>
            <Button icon={<SavedSearch fill="#FFF" />} width={'170px'} onClick={() => setToggleSavedFiltersModal(true)}>
              Vos filtres
            </Button>
          </Grid>
        )}
        <Grid item>
          <Button
            width={'170px'}
            icon={<FilterList height="15px" fill="#FFF" />}
            onClick={() => setToggleFilterByModal(true)}
          >
            Filtrer
          </Button>
        </Grid>
      </Grid>

      <Grid container alignItems="center" item xs={12}>
        <Grid container item xs={12} lg={5}>
          {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && <CircularProgress />}
          {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
            <DisplayDigits nb={searchResults.nb} total={searchResults.total} label={searchResults.label as string} />
          )}
        </Grid>

        <Grid container item xs={12} lg={7} justifyContent="flex-end">
          <SearchInput
            value={searchInput}
            placeholder={'Rechercher'}
            onchange={(newValue: string) => changeSearchInput(newValue)}
          />
        </Grid>
      </Grid>
      {filtersAsArray.length > 0 && (
        <Grid item xs={12}>
          {filtersAsArray.map((filter, index) => (
            <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
          ))}
        </Grid>
      )}

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

      <Modal
        title="Filtrer par :"
        open={toggleFilterByModal}
        width={'600px'}
        onClose={() => setToggleFilterByModal(false)}
        onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
      >
        {!searchResults.deidentified && <NdaFilter name={FilterKeys.NDA} value={nda} />}
        <ModalityFilter value={modality} name={FilterKeys.MODALITY} modalitiesList={allModalities} />
        <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
        <ExecutiveUnitsFilter
          value={executiveUnits}
          name={FilterKeys.EXECUTIVE_UNITS}
          criteriaName={CriteriaName.Imaging}
        />
      </Modal>
      <Modal
        title="Filtres sauvegardés"
        open={toggleSavedFiltersModal}
        onClose={() => {
          setToggleSavedFiltersModal(false)
          resetSavedFilterError()
        }}
        onSubmit={() => {
          if (selectedSavedFilter) addSearchCriterias(selectedSavedFilter.filterParams)
        }}
        validationText="Appliquer le filtre"
      >
        <List
          values={allSavedFiltersAsListItems}
          count={allSavedFilters?.count || 0}
          onDelete={deleteSavedFilters}
          onDisplay={() => {
            setToggleFilterInfoModal(true)
            setIsReadonlyFilterInfoModal(true)
          }}
          onEdit={
            maintenanceIsActive
              ? undefined
              : () => {
                  setToggleFilterInfoModal(true)
                  setIsReadonlyFilterInfoModal(false)
                }
          }
          onSelect={(filter) => selectFilter(filter)}
          fetchPaginateData={() => getSavedFilters(allSavedFilters?.next)}
        >
          <Modal
            title={isReadonlyFilterInfoModal ? 'Informations' : 'Modifier le filtre'}
            open={toggleFilterInfoModal}
            readonly={isReadonlyFilterInfoModal}
            onClose={() => setToggleFilterInfoModal(false)}
            onSubmit={(newFilters) => {
              const { name, searchInput, modality, nda, startDate, endDate, executiveUnits } = newFilters
              patchSavedFilter(
                name,
                {
                  searchInput,
                  orderBy: {
                    orderBy: Order.STUDY_DATE,
                    orderDirection: Direction.DESC
                  },
                  filters: { modality, nda, startDate, endDate, executiveUnits }
                },
                searchResults.deidentified ?? true
              )
            }}
            validationText={isReadonlyFilterInfoModal ? 'Fermer' : 'Sauvegarder'}
          >
            <Grid container direction="column" gap="8px">
              <Grid item container direction="column">
                <TextInput
                  name="name"
                  label="Nom :"
                  value={selectedSavedFilter?.filterName}
                  error={savedFiltersErrors}
                  disabled={isReadonlyFilterInfoModal}
                  minLimit={2}
                  maxLimit={50}
                />
              </Grid>
              {!searchResults.deidentified && (
                <Grid item container direction="column" paddingBottom="8px">
                  <TextInput
                    name="searchInput"
                    label="Recherche textuelle :"
                    disabled={isReadonlyFilterInfoModal}
                    value={selectedSavedFilter?.filterParams.searchInput}
                  />
                </Grid>
              )}
              <Grid item>
                {!searchResults.deidentified && (
                  <NdaFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.NDA}
                    value={selectedSavedFilter?.filterParams.filters.nda || ''}
                  />
                )}
                <ModalityFilter
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.modality || []}
                  name={FilterKeys.MODALITY}
                  modalitiesList={allModalities}
                />
                <DatesRangeFilter
                  disabled={isReadonlyFilterInfoModal}
                  values={[
                    selectedSavedFilter?.filterParams.filters.startDate,
                    selectedSavedFilter?.filterParams.filters.endDate
                  ]}
                  names={[FilterKeys.START_DATE, FilterKeys.END_DATE]}
                />
                <ExecutiveUnitsFilter
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.executiveUnits || []}
                  name={FilterKeys.EXECUTIVE_UNITS}
                  criteriaName={CriteriaName.Imaging}
                />
              </Grid>
            </Grid>
          </Modal>
        </List>
      </Modal>
      <Modal
        title="Sauvegarder les filtres"
        open={toggleSaveFiltersModal}
        onClose={() => {
          setToggleSaveFiltersModal(false)
          resetSavedFilterError()
        }}
        onSubmit={({ filtersName }) =>
          postSavedFilter(filtersName, { searchInput, filters, orderBy }, searchResults.deidentified ?? true)
        }
      >
        <TextInput name="filtersName" error={savedFiltersErrors} label="Nom" minLimit={2} maxLimit={50} />
      </Modal>
    </Grid>
  )
}

export default PatientImaging
