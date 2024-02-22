import React, { useState, useEffect, useRef, useMemo } from 'react'
import useSearchCriterias, { initImagingCriterias } from 'reducers/searchCriteriasReducer'
import services from 'services/aphp'

import { CircularProgress, Grid, Tooltip } from '@mui/material'
import { FilterList, Save, SavedSearch } from '@mui/icons-material'

import Button from 'components/ui/Button'
import Chip from 'components/ui/Chip'
import DataTableImaging from 'components/DataTable/DataTableImaging'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import IppFilter from 'components/Filters/IppFilter'
import Modal from 'components/ui/Modal'
import ModalityFilter from 'components/Filters/ModalityFilter/ModalityFilter'
import NdaFilter from 'components/Filters/NdaFilter'
import SearchInput from 'components/ui/Searchbar/SearchInput'

import {
  CohortImaging,
  CriteriaName,
  HierarchyElement,
  ImagingData,
  LoadingStatus,
  DTTB_ResultsType as ResultsType
} from 'types'
import { Direction, FilterKeys, ImagingFilters, Order } from 'types/searchCriterias'

import { cancelPendingRequest } from 'utils/abortController'
import { selectFiltersAsArray } from 'utils/filters'

import { CanceledError } from 'axios'
import { RessourceType } from 'types/requestCriterias'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import TextInput from 'components/Filters/TextInput'
import List from 'components/ui/List'
import { useAppSelector } from 'state'

type ImagingListProps = {
  groupId?: string
  deidentified?: boolean
}

const ImagingList = ({ groupId, deidentified }: ImagingListProps) => {
  const [searchResults, setSearchResults] = useState<ResultsType>({ nb: 0, total: 0, label: 'résultats' })
  const [imagingList, setImagingList] = useState<CohortImaging[]>([])

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
  const [allModalities, setAllModalities] = useState<HierarchyElement[]>([])

  const [page, setPage] = useState(1)
  const [
    {
      orderBy,
      searchInput,
      filters,
      filters: { ipp, nda, startDate, endDate, executiveUnits, modality }
    },
    { changeOrderBy, changeSearchInput, addFilters, removeFilter, addSearchCriterias }
  ] = useSearchCriterias(initImagingCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ ipp, nda, startDate, endDate, executiveUnits, modality })
  }, [ipp, nda, startDate, endDate, executiveUnits, modality])
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

      const response = await services.cohorts.fetchImagingList(
        {
          deidentified: !!deidentified,
          page,
          searchCriterias: {
            searchInput,
            orderBy,
            filters: {
              ipp,
              nda,
              startDate,
              endDate,
              executiveUnits,
              modality
            }
          }
        },
        groupId,
        controllerRef.current?.signal
      )

      if (response) {
        const { totalImaging, totalAllImaging, imagingList } = response as ImagingData
        setImagingList(imagingList)
        setSearchResults((prevState) => ({
          ...prevState,
          nb: totalImaging,
          total: totalAllImaging
        }))
      }

      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      } else {
        setImagingList([])
        setLoadingStatus(LoadingStatus.SUCCESS)
      }
    }
  }

  useEffect(() => {
    const fetch = async () => {
      const modalities = await services.cohortCreation.fetchModalities()
      setAllModalities(modalities)
    }
    fetch()
  }, [])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [ipp, nda, startDate, endDate, orderBy, searchInput, executiveUnits, modality])

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
    <Grid container justifyContent="flex-end" gap="20px">
      <Grid container justifyContent="flex-end" gap="10px">
        <Grid container item xs={12} md={10} lg={7} xl={5} justifyContent="flex-end" spacing={1}>
          {(filtersAsArray.length > 0 || searchInput) && (
            <Grid container item xs={12} md={5}>
              <Tooltip title={maintenanceIsActive ? "Ce bouton est desactivé en fonction d'une maintenance." : ''}>
                <Grid container>
                  <Button
                    width="100%"
                    icon={<Save height="15px" fill="#FFF" />}
                    onClick={() => setToggleSaveFiltersModal(true)}
                    color="secondary"
                    disabled={maintenanceIsActive}
                  >
                    Enregistrer filtres
                  </Button>
                </Grid>
              </Tooltip>
            </Grid>
          )}
          <Grid container item xs={12} md={!!allSavedFilters?.count ? 7 : 3} justifyContent="space-between">
            {!!allSavedFilters?.count && (
              <Button icon={<SavedSearch fill="#FFF" />} width="49%" onClick={() => setToggleSavedFiltersModal(true)}>
                Vos filtres
              </Button>
            )}
            <Button
              icon={<FilterList height="15px" fill="#FFF" />}
              width={!!allSavedFilters?.count ? '49%' : '100%'}
              onClick={() => setToggleFilterByModal(true)}
            >
              Filtrer
            </Button>
          </Grid>
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
        <Grid item xs={12} margin="0px 0px 10px">
          {filtersAsArray.map((filter, index) => (
            <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
          ))}
        </Grid>
      )}

      <Grid item xs={12}>
        <DataTableImaging
          loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
          deidentified={!!deidentified}
          imagingList={imagingList}
          orderBy={orderBy}
          setOrderBy={(orderBy) => changeOrderBy(orderBy)}
          page={page}
          setPage={setPage}
          total={searchResults.nb}
          showIpp
        />
      </Grid>
      <Modal
        title="Filtrer par :"
        open={toggleFilterByModal}
        color="secondary"
        onClose={() => setToggleFilterByModal(false)}
        onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
      >
        {!deidentified && <NdaFilter name={FilterKeys.NDA} value={nda} />}
        {!deidentified && <IppFilter name={FilterKeys.IPP} value={ipp || ''} />}
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
          onDelete={maintenanceIsActive ? undefined : deleteSavedFilters}
          onSelect={(filter) => selectFilter(filter)}
          fetchPaginateData={() => getSavedFilters(allSavedFilters?.next)}
        >
          <Modal
            title={isReadonlyFilterInfoModal ? 'Informations' : 'Modifier le filtre'}
            open={toggleFilterInfoModal}
            readonly={isReadonlyFilterInfoModal}
            color="secondary"
            onClose={() => setToggleFilterInfoModal(false)}
            onSubmit={({ filterName, searchInput, modality, nda, startDate, endDate, executiveUnits }) => {
              patchSavedFilter(
                filterName,
                {
                  searchInput,
                  orderBy: {
                    orderBy: Order.STUDY_DATE,
                    orderDirection: Direction.DESC
                  },
                  filters: { modality, nda, startDate, endDate, executiveUnits }
                },
                deidentified ?? true
              )
            }}
            validationText="Sauvegarder"
          >
            <Grid container direction="column" gap="8px">
              <Grid item container direction="column">
                <TextInput
                  name="filterName"
                  label="Nom :"
                  value={selectedSavedFilter?.filterName}
                  error={savedFiltersErrors}
                  disabled={isReadonlyFilterInfoModal}
                  minLimit={2}
                  maxLimit={50}
                />
              </Grid>
              {!deidentified && (
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
                {!deidentified && (
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
        title="Sauvegarder le filtre"
        color="secondary"
        open={toggleSaveFiltersModal}
        onClose={() => {
          setToggleSaveFiltersModal(false)
          resetSavedFilterError()
        }}
        onSubmit={({ filtersName }) =>
          postSavedFilter(filtersName, { searchInput, filters, orderBy }, deidentified ?? true)
        }
      >
        <TextInput name="filtersName" error={savedFiltersErrors} label="Nom" minLimit={2} maxLimit={50} />
      </Modal>
    </Grid>
  )
}

export default ImagingList
