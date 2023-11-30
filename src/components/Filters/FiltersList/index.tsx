import Modal, { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import FilterListItems from 'components/ui/FilterListItems'
import { FilterKeys, Filters, PatientsFilters, SavedFilter, SearchCriterias } from 'types/searchCriterias'
import { Item } from 'components/ui/FilterListItems/ListItem'
import Button from 'components/ui/Button'
import { DeleteOutline } from '@mui/icons-material'
import { Grid, TextField, Typography } from '@mui/material'
import GendersFilter from '../GendersFilter'
import VitalStatusesFilter from '../VitalStatusesFilter'
import BirthdatesRangesFilter from '../BirthdatesRangesFilters'
import { mapStringToSearchCriteria } from 'mappers/filters'
import { useAppSelector } from 'state'
import { MeState } from 'state/me'
import { RessourceType } from 'types/requestCriterias'
import { patchFiltersService } from 'services/aphp/servicePatients'

enum Mode {
  SINGLE,
  MULTIPLE
}

type FiltersListProps = {
  values: SavedFilter[]
  name: string
  deidentified?: boolean | null
  savedFiltersCount: number
  onSubmitDelete: (value: any) => void
  onSubmitPatch: () => void
  setSelectedFilter: (value: SearchCriterias<PatientsFilters>) => void
  fetchPaginateData: () => void
}

type FilterInfoModal = {
  filterUuid?: string
  filterName: string
  filterParams: SearchCriterias<PatientsFilters>
}

const FiltersList = ({
  values,
  deidentified,
  savedFiltersCount,
  onSubmitDelete,
  onSubmitPatch,
  setSelectedFilter,
  fetchPaginateData
}: FiltersListProps) => {
  const context = useContext(FormContext)
  const [filters, setFilters] = useState<Item[]>(
    values.map((value) => {
      return { id: value.uuid, name: value.name, checked: false }
    })
  )

  const [mode, setMode] = useState(Mode.SINGLE)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [selectedItemInfo, setSelectedItemInfo] = useState<FilterInfoModal>()
  const [isReadonlyModal, setIsReadonlyModal] = useState(true)

  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const maintenanceIsActive = meState?.maintenance?.active

  const showModalFilterInfo = (selectedItem: Item, isReadonly: boolean) => {
    const savedFilterInfo = values.find((filter) => filter.uuid === selectedItem.id)

    if (savedFilterInfo) {
      setSelectedItemInfo({
        filterUuid: savedFilterInfo.uuid,
        filterName: savedFilterInfo.name,
        filterParams: mapStringToSearchCriteria(savedFilterInfo.filter)
      })
      setToggleFilterInfoModal(true)
      setIsReadonlyModal(isReadonly)
    }
  }

  const handleSelectedFilter = (newFilters: Item[]) => {
    if (mode === Mode.SINGLE) {
      const selectedFilter = newFilters.find((newFilter) => newFilter.checked)
      const savedFilterInfo = values.find((filter) => filter.uuid === selectedFilter?.id)

      setSelectedFilter(mapStringToSearchCriteria(savedFilterInfo?.filter ?? ''))
    }
    setFilters(newFilters)
  }

  const handleDeleteSelectedFilters = async () => {
    const checkedFilterIdsToDelete = filters.filter((filter) => filter.checked).map((filter) => filter.id)
    onSubmitDelete(checkedFilterIdsToDelete)

    const keptFilters = filters.filter((filter) => !filter.checked)
    setFilters(keptFilters)
  }

  const submitEditedFilter = async (newFilterInfos: Filters) => {
    await patchFiltersService(
      RessourceType.PATIENT,
      selectedItemInfo?.filterUuid || '',
      selectedItemInfo?.filterName || '',
      {
        ...selectedItemInfo?.filterParams,
        filters: newFilterInfos
      } as SearchCriterias<Filters>
    )

    const updatedFilters = filters.map((filter) => {
      if (filter.id === selectedItemInfo?.filterUuid) {
        return { ...filter, name: selectedItemInfo?.filterName || '' }
      }
      return filter
    })
    setFilters(updatedFilters)
    onSubmitPatch()
  }

  useEffect(() => {
    context?.updateError(false)
    if (context?.updateError && mode === Mode.MULTIPLE) {
      context.updateError(true)
    }
    setFilters(
      filters.map((value) => {
        return { ...value, checked: false }
      })
    )
  }, [mode])

  useEffect(
    () =>
      setFilters(
        values.map((value) => {
          return {
            id: value.uuid,
            name: value.name,
            checked: filters.find((filter) => filter.id === value.uuid)?.checked || false
          }
        })
      ),
    [values]
  )

  return (
    <>
      {mode === Mode.SINGLE && (
        <Grid container item xs={4} margin="0px 0px 20px 0px">
          <Button
            icon={<DeleteOutline />}
            color="primary"
            onClick={() => setMode(Mode.MULTIPLE)}
            disabled={maintenanceIsActive}
          >
            Supprimer
          </Button>
        </Grid>
      )}
      {mode === Mode.MULTIPLE && (
        <Grid container justifyContent="space-between" item xs={8} margin="0px 0px 20px 0px">
          <Button width="60%" icon={<DeleteOutline />} color="error" onClick={handleDeleteSelectedFilters}>
            Confirmer
          </Button>
          <Button variant="text" color="error" width="40%" onClick={() => setMode(Mode.SINGLE)}>
            <Typography fontWeight="700">Annuler</Typography>
          </Button>
        </Grid>
      )}
      {Boolean(filters.length) ? (
        <FilterListItems
          values={filters}
          multiple={mode === Mode.MULTIPLE}
          savedFiltersCount={savedFiltersCount}
          onchange={handleSelectedFilter}
          onItemEyeClick={(item) => showModalFilterInfo(item, true)}
          onItemPencilClick={(item) => showModalFilterInfo(item, false)}
          fetchPaginateData={fetchPaginateData}
        />
      ) : (
        <Typography fontWeight="700" align="center" sx={{ padding: '8px' }}>
          Aucun filtre n'a été enregistré
        </Typography>
      )}

      <Modal
        title="Information sur le filtre"
        open={toggleFilterInfoModal}
        readonly={isReadonlyModal}
        onClose={() => setToggleFilterInfoModal(false)}
        onSubmit={submitEditedFilter}
        validationText={isReadonlyModal ? 'Fermer' : 'Sauvegarder'}
      >
        <Grid container direction="column" sx={{ gap: '16px' }}>
          <Grid item container direction="column" sx={{ gap: '8px' }}>
            <Grid item>
              <Typography variant="h3">Nom :</Typography>
            </Grid>
            <Grid item>
              <TextField
                size="small"
                value={selectedItemInfo?.filterName}
                fullWidth
                onChange={(e) =>
                  !isReadonlyModal &&
                  setSelectedItemInfo({ ...selectedItemInfo, filterName: e.target.value } as FilterInfoModal)
                }
              />
            </Grid>
          </Grid>
          <Grid item container direction="column" sx={{ gap: '8px' }}>
            <Grid item>
              <Typography variant="h3">Recherche textuelle :</Typography>
            </Grid>
            <Grid item>
              <TextField
                size="small"
                value={selectedItemInfo?.filterParams.searchInput}
                fullWidth
                placeholder="Votre recherche textuelle"
                onChange={(e) =>
                  !isReadonlyModal &&
                  setSelectedItemInfo({
                    ...selectedItemInfo,
                    filterParams: { ...selectedItemInfo?.filterParams, searchInput: e.target.value }
                  } as FilterInfoModal)
                }
              />
            </Grid>
          </Grid>
          <Grid item>
            <GendersFilter name={FilterKeys.GENDERS} value={selectedItemInfo?.filterParams.filters.genders || []} />
            <VitalStatusesFilter
              name={FilterKeys.VITAL_STATUSES}
              value={selectedItemInfo?.filterParams.filters.vitalStatuses || []}
            />
            <BirthdatesRangesFilter
              name={FilterKeys.BIRTHDATES}
              value={selectedItemInfo?.filterParams.filters.birthdatesRanges || ['', '']}
              deidentified={deidentified || false}
            />
          </Grid>
        </Grid>
      </Modal>
    </>
  )
}

export default FiltersList
