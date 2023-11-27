import Modal, { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import ListItems from 'components/ui/ListItems'
import { FilterKeys, PatientsFilters, SavedFilter, SearchCriterias } from 'types/searchCriterias'
import { Item } from 'components/ui/ListItems/ListItem'
import Button from 'components/ui/Button'
import { DeleteOutline } from '@mui/icons-material'
import { Grid, TextField, Typography } from '@mui/material'
import GendersFilter from '../GendersFilter'
import VitalStatusesFilter from '../VitalStatusesFilter'
import BirthdatesRangesFilter from '../BirthdatesRangesFilters'
import { mapStringToSearchCriteria } from 'mappers/filters'

enum Mode {
  SINGLE,
  MULTIPLE
}

type FiltersListProps = {
  values: SavedFilter[]
  name: string
  deidentified?: boolean | null
  onSubmitDelete: (value: any) => void
  setSelectedFilter: (value: SearchCriterias<PatientsFilters>) => void
}

type FilterInfoModal = {
  filterName: string
  filterParams: SearchCriterias<PatientsFilters>
}

const FiltersList = ({ values, deidentified, onSubmitDelete, setSelectedFilter }: FiltersListProps) => {
  const context = useContext(FormContext)
  const [filters, setFilters] = useState<Item[]>(
    values.map((value) => {
      return { id: value.uuid, name: value.name, checked: false }
    })
  )

  const [mode, setMode] = useState(Mode.SINGLE)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [selectedItemInfo, setSelectedItemInfo] = useState<FilterInfoModal>()

  const displaySelectedFilterInfo = (selectedItem: Item) => {
    const savedFilterInfo = values.find((filter) => filter.uuid === selectedItem.id)

    if (savedFilterInfo) {
      setSelectedItemInfo({
        filterName: savedFilterInfo.name,
        filterParams: mapStringToSearchCriteria(savedFilterInfo.filter)
      })
      setToggleFilterInfoModal(true)
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

  return (
    <>
      {mode === Mode.SINGLE && (
        <Grid container item xs={4} margin="0px 0px 20px 0px">
          <Button icon={<DeleteOutline />} color="primary" onClick={() => setMode(Mode.MULTIPLE)}>
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
        <ListItems
          values={filters}
          multiple={mode === Mode.MULTIPLE}
          onchange={handleSelectedFilter}
          onItemEyeClick={displaySelectedFilterInfo}
        />
      ) : (
        <Typography fontWeight="700" align="center" sx={{ padding: '8px' }}>
          Aucun filtre n'a été enregistré
        </Typography>
      )}

      <Modal
        title="Information sur le filtre"
        open={toggleFilterInfoModal}
        noActions
        onClose={() => setToggleFilterInfoModal(false)}
        validationText="Fermer"
      >
        <Grid container direction="column" sx={{ gap: '16px' }}>
          <Grid item container direction="column" sx={{ gap: '8px' }}>
            <Grid item>
              <Typography variant="h3">Nom :</Typography>
            </Grid>
            <Grid item>
              <TextField size="small" value={selectedItemInfo?.filterName} fullWidth />
            </Grid>
          </Grid>
          <Grid item container direction="column" sx={{ gap: '8px' }}>
            <Grid item>
              <Typography variant="h3">Recherche textuelle :</Typography>
            </Grid>
            <Grid item>
              <TextField size="small" value={selectedItemInfo?.filterParams.searchInput} fullWidth />
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
