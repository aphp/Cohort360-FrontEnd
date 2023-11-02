import React, { useEffect, useMemo, useRef, useState } from 'react'

import { Checkbox, CircularProgress, Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import DataTableObservation from 'components/DataTable/DataTableObservation'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchBiology } from 'state/patient'
import { CriteriaName, LoadingStatus } from 'types'

import useStyles from './styles'
import { cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { BiologyFilters, Direction, FilterKeys, Order } from 'types/searchCriterias'
import { selectFiltersAsArray } from 'utils/filters'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import { BlockWrapper } from 'components/ui/Layout'
import useSearchCriterias, { initBioSearchCriterias } from 'reducers/searchCriteriasReducer'
import Chip from 'components/ui/Chip'
import { AlertWrapper } from 'components/ui/Alert'
import AnabioFilter from 'components/Filters/AnabioFilter'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import LoincFilter from 'components/Filters/LoincFilter'
import NdaFilter from 'components/Filters/NdaFilter'
import { Save, SavedSearch } from '@mui/icons-material'
import { RessourceType } from 'types/requestCriterias'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import List from 'components/ui/List'
import TextInput from 'components/ui/TextInput'

type PatientBiologyProps = {
  groupId?: string
}

const PatientBiology = ({ groupId }: PatientBiologyProps) => {
  const { classes } = useStyles()
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.down('lg'))
  const dispatch = useAppDispatch()
  const patient = useAppSelector((state) => state.patient)
  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
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
  } = useSavedFilters<BiologyFilters>(RessourceType.OBSERVATION)

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const searchResults = {
    deidentified: patient?.deidentified || false,
    list: patient?.biology?.list ?? [],
    nb: patient?.biology?.count ?? 0,
    total: patient?.biology?.total ?? 0,
    label: 'résultat(s)'
  }

  const [page, setPage] = useState(1)
  const [
    {
      orderBy,
      searchInput,
      filters,
      filters: { nda, loinc, anabio, startDate, endDate, executiveUnits, validatedStatus }
    },
    { changeOrderBy, changeSearchInput, addFilters, removeFilter, addSearchCriterias }
  ] = useSearchCriterias(initBioSearchCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ nda, validatedStatus, loinc, anabio, startDate, endDate, executiveUnits })
  }, [nda, loinc, anabio, startDate, endDate, executiveUnits])

  const controllerRef = useRef<AbortController | null>(null)
  const meState = useAppSelector((state) => state.me)
  const maintenanceIsActive = meState?.maintenance?.active

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
              filters: { validatedStatus, nda, loinc, anabio, startDate, endDate, executiveUnits }
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
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [nda, loinc, anabio, startDate, endDate, executiveUnits, validatedStatus, orderBy, searchInput])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      _fetchBiology()
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
    <Grid container justifyContent="flex-end" className={classes.documentTable} gap="20px">
      <BlockWrapper item xs={12}>
        <AlertWrapper severity="warning">
          Les mesures de biologie sont pour l'instant restreintes aux 3870 codes ANABIO correspondants aux analyses les
          plus utilisées au niveau national et à l'AP-HP. De plus, les résultats concernent uniquement les analyses
          quantitatives enregistrées sur GLIMS, qui ont été validées et mises à jour depuis mars 2020.
        </AlertWrapper>
      </BlockWrapper>
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
            <DisplayDigits nb={searchResults.nb} total={searchResults.total} label={searchResults.label as string} />
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
          {filtersAsArray.map((filter, index) => (
            <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
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
        open={toggleFilterByModal}
        width={'600px'}
        onClose={() => setToggleFilterByModal(false)}
        onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
      >
        {!searchResults.deidentified && <NdaFilter name={FilterKeys.NDA} value={nda} />}
        <AnabioFilter name={FilterKeys.ANABIO} value={anabio} />
        <LoincFilter name={FilterKeys.LOINC} value={loinc} />
        <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
        <ExecutiveUnitsFilter
          value={executiveUnits}
          name={FilterKeys.EXECUTIVE_UNITS}
          criteriaName={CriteriaName.Biology}
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
              const { name, searchInput, nda, anabio, loinc, startDate, endDate, validatedStatus, executiveUnits } =
                newFilters
              patchSavedFilter(
                name,
                {
                  searchInput,
                  orderBy: { orderBy: Order.FAMILY, orderDirection: Direction.ASC },
                  filters: { nda, anabio, loinc, startDate, endDate, validatedStatus, executiveUnits }
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
              <Grid item container direction="column" paddingBottom="8px">
                <TextInput
                  name="searchInput"
                  label="Recherche textuelle :"
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.searchInput}
                />
              </Grid>
              <Grid item>
                <AnabioFilter
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.ANABIO}
                  value={selectedSavedFilter?.filterParams.filters.anabio || ''}
                />
                <LoincFilter
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.LOINC}
                  value={selectedSavedFilter?.filterParams.filters.loinc || ''}
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
                  criteriaName={CriteriaName.Biology}
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

export default PatientBiology
