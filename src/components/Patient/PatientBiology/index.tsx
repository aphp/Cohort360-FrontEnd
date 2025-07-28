import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Checkbox, CircularProgress, Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material'
import FilterList from 'assets/icones/filter.svg?react'
import DataTableObservation from 'components/DataTable/DataTableObservation'
import { useAppSelector, useAppDispatch } from 'state'
import { fetchBiology } from 'state/patient'
import { LoadingStatus } from 'types'
import useStyles from './styles'
import { cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { BiologyFilters, Direction, FilterKeys, LabelObject, Order } from 'types/searchCriterias'
import { selectFiltersAsArray } from 'utils/filters'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import { BlockWrapper } from 'components/ui/Layout'
import useSearchCriterias, { initBioSearchCriterias } from 'reducers/searchCriteriasReducer'
import Chip from 'components/ui/Chip'
import { AlertWrapper } from 'components/ui/Alert'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import { Save, SavedSearch } from '@mui/icons-material'
import { ResourceType } from 'types/requestCriterias'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import List from 'components/ui/List'
import TextInput from 'components/Filters/TextInput'
import { SourceType } from 'types/scope'
import { useSearchParams } from 'react-router-dom'
import { checkIfPageAvailable, cleanSearchParams, handlePageError } from 'utils/paginationUtils'
import { getConfig } from 'config'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { getValueSetsFromSystems } from 'utils/valueSets'
import CodeFilter from 'components/Filters/CodeFilter'
import { v4 as uuidv4 } from 'uuid'
import MultiSelectInput from 'components/Filters/MultiSelectInput'

const PatientBiology = () => {
  const { classes } = useStyles()
  const [searchParams, setSearchParams] = useSearchParams()
  const getPageParam = searchParams.get('page')
  const groupId = searchParams.get('groupId') ?? undefined

  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.down('lg'))
  const dispatch = useAppDispatch()
  const patient = useAppSelector((state) => state.patient)
  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
  const [encounterStatusList, setEncounterStatusList] = useState<LabelObject[]>([])
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
  } = useSavedFilters<BiologyFilters>(ResourceType.OBSERVATION)

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const searchResults = {
    deidentified: patient?.deidentified ?? false,
    list: patient?.biology?.list ?? [],
    nb: patient?.biology?.count ?? 0,
    total: patient?.biology?.total ?? 0,
    label: 'résultat(s)'
  }

  const [page, setPage] = useState(getPageParam ? parseInt(getPageParam, 10) : 1)
  const [
    {
      orderBy,
      searchInput,
      filters,
      filters: { nda, code, startDate, endDate, executiveUnits, validatedStatus, encounterStatus }
    },
    { changeOrderBy, changeSearchInput, addFilters, removeFilter, addSearchCriterias }
  ] = useSearchCriterias(initBioSearchCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({
      nda,
      validatedStatus,
      code,
      startDate,
      endDate,
      executiveUnits,
      encounterStatus
    })
  }, [nda, code, startDate, endDate, executiveUnits, encounterStatus])

  const controllerRef = useRef<AbortController | null>(null)
  const meState = useAppSelector((state) => state.me)
  const maintenanceIsActive = meState?.maintenance?.active
  const isFirstRender = useRef(true)

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
              filters: { validatedStatus, nda, code, startDate, endDate, executiveUnits, encounterStatus }
            }
          },
          groupId,
          signal: controllerRef.current?.signal
        })
      )
      if (response) {
        checkIfPageAvailable(searchResults.total, page, setPage, dispatch)
      }
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
    const fetchEncounterStatusList = async () => {
      const encounterStatus = (await getCodeList(getConfig().core.valueSets.encounterStatus.url)).results
      setEncounterStatusList(encounterStatus)
    }
    fetchEncounterStatusList()
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      setLoadingStatus(LoadingStatus.IDDLE)
      setPage(1)
    }
  }, [nda, code, startDate, endDate, executiveUnits, validatedStatus, orderBy, searchInput, encounterStatus])

  useEffect(() => {
    setSearchParams(cleanSearchParams({ page: page.toString(), groupId: groupId }))

    handlePageError(page, setPage, dispatch, setLoadingStatus)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      _fetchBiology()
    }
  }, [loadingStatus])

  const references = useMemo(() => {
    return getValueSetsFromSystems([
      getConfig().features.observation.valueSets.biologyHierarchyAnabio.url,
      getConfig().features.observation.valueSets.biologyHierarchyLoinc.url
    ])
  }, [])

  return (
    <Grid container justifyContent="flex-end" className={classes.documentTable} gap="20px">
      <BlockWrapper item xs={12}>
        <AlertWrapper severity="warning">
          Les mesures de biologies correspondent aux codes dont l'utilisation à l'AP-HP est supérieure à 3 analyses
          biologiques. De plus, les résultats concernent uniquement les analyses quantitatives enregistrées sur GLIMS,
          qui ont été validées et mises à jour depuis mars 2020.
        </AlertWrapper>
      </BlockWrapper>
      <Grid container item xs={12} md={10} lg={7} xl={5} justifyContent="flex-end" spacing={1}>
        {(filtersAsArray.length > 0 || searchInput) && (
          <Grid container item xs={12} md={5}>
            <Tooltip title={maintenanceIsActive ? "Ce bouton est desactivé en fonction d'une maintenance." : ''}>
              <Grid container>
                <Button
                  width="100%"
                  startIcon={<Save height="15px" fill="#FFF" />}
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
        <Grid container item xs={12} md={allSavedFilters?.count ? 7 : 3} justifyContent="space-between">
          {!!allSavedFilters?.count && (
            <Button
              startIcon={<SavedSearch fill="#FFF" />}
              width="49%"
              onClick={() => setToggleSavedFiltersModal(true)}
            >
              Vos filtres
            </Button>
          )}
          <Button
            startIcon={<FilterList height="15px" fill="#FFF" />}
            width={allSavedFilters?.count ? '49%' : '100%'}
            onClick={() => setToggleFilterByModal(true)}
          >
            Filtrer
          </Button>
        </Grid>
      </Grid>
      <Grid item xs={12} container alignItems="center" style={isMd ? { flexWrap: 'wrap-reverse', gap: '10px' } : {}}>
        <Grid container item xs={12} lg={4} alignItems="center" wrap="nowrap">
          <Checkbox checked={validatedStatus} disabled />
          <Typography style={{ color: '#505050' }}>
            N'afficher que les analyses dont les résultats ont été validés
          </Typography>
        </Grid>
        <Grid item xs={12} lg={4} container justifyContent={isMd ? 'left' : 'center'}>
          {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && <CircularProgress />}
          {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
            <DisplayDigits nb={searchResults.nb} total={searchResults.total} label={searchResults.label} />
          )}
        </Grid>
        <Grid item md={12} lg={4} container>
          <SearchInput
            width="100%"
            value={searchInput}
            placeholder="Rechercher"
            onchange={(newValue) => changeSearchInput(newValue)}
          />
        </Grid>
      </Grid>
      {filtersAsArray.length > 0 && (
        <Grid item xs={12}>
          {filtersAsArray.map((filter) => (
            <Chip key={uuidv4()} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
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

      <Modal
        title="Filtrer par :"
        color="secondary"
        open={toggleFilterByModal}
        onClose={() => setToggleFilterByModal(false)}
        onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
      >
        {!searchResults.deidentified && (
          <TextInput name={FilterKeys.NDA} value={nda} label="NDA :" placeholder="Exemple: 6601289264,141740347" />
        )}
        <CodeFilter name={FilterKeys.CODE} value={code} references={references} />
        <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
        <ExecutiveUnitsFilter
          sourceType={SourceType.BIOLOGY}
          value={executiveUnits}
          name={FilterKeys.EXECUTIVE_UNITS}
        />
        <MultiSelectInput
          value={encounterStatus}
          name={FilterKeys.ENCOUNTER_STATUS}
          options={encounterStatusList}
          label="Statut de la visite associée :"
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
          count={allSavedFilters?.count ?? 0}
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
            color="secondary"
            open={toggleFilterInfoModal}
            readonly={isReadonlyFilterInfoModal}
            onClose={() => setToggleFilterInfoModal(false)}
            onSubmit={({
              filterName,
              searchInput,
              nda,
              code,
              startDate,
              endDate,
              validatedStatus,
              executiveUnits,
              encounterStatus
            }) => {
              patchSavedFilter(
                filterName,
                {
                  searchInput,
                  orderBy: { orderBy: Order.FAMILY, orderDirection: Direction.ASC },
                  filters: { nda, code, startDate, endDate, validatedStatus, executiveUnits, encounterStatus }
                },
                searchResults.deidentified ?? true
              )
            }}
            validationText="Sauvegarder"
          >
            <Grid container gap="8px">
              <Grid item container>
                <Grid item xs={12}>
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
                <Grid item xs={12}>
                  <TextInput
                    name="searchInput"
                    label="Recherche textuelle :"
                    disabled={isReadonlyFilterInfoModal}
                    value={selectedSavedFilter?.filterParams.searchInput}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextInput
                    name={FilterKeys.NDA}
                    disabled={isReadonlyFilterInfoModal}
                    value={selectedSavedFilter?.filterParams.filters.nda ?? ''}
                    label="NDA :"
                    placeholder="Exemple: 6601289264,141740347"
                  />
                </Grid>
                <Grid item xs={12}>
                  <CodeFilter
                    references={references}
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.CODE}
                    value={selectedSavedFilter?.filterParams.filters.code ?? []}
                  />
                </Grid>
                <Grid item xs={12}>
                  <DatesRangeFilter
                    disabled={isReadonlyFilterInfoModal}
                    values={[
                      selectedSavedFilter?.filterParams.filters.startDate,
                      selectedSavedFilter?.filterParams.filters.endDate
                    ]}
                    names={[FilterKeys.START_DATE, FilterKeys.END_DATE]}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ExecutiveUnitsFilter
                    sourceType={SourceType.BIOLOGY}
                    disabled={isReadonlyFilterInfoModal}
                    value={selectedSavedFilter?.filterParams.filters.executiveUnits ?? []}
                    name={FilterKeys.EXECUTIVE_UNITS}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MultiSelectInput
                    disabled={isReadonlyFilterInfoModal}
                    value={selectedSavedFilter?.filterParams.filters.encounterStatus ?? []}
                    name={FilterKeys.ENCOUNTER_STATUS}
                    options={encounterStatusList}
                    label="Statut de la visite associée :"
                  />
                </Grid>
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
          postSavedFilter(filtersName, { searchInput, filters, orderBy }, searchResults.deidentified ?? true)
        }
      >
        <TextInput name="filtersName" error={savedFiltersErrors} label="Nom" minLimit={2} maxLimit={50} />
      </Modal>
    </Grid>
  )
}

export default PatientBiology
