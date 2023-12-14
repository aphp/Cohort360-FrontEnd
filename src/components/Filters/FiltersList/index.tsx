import React, { PropsWithChildren, useContext, useEffect, useState } from 'react'
import { FormContext } from 'components/ui/Modal'
import FilterListItems from 'components/ui/FilterListItems'
import { SavedFilter } from 'types/searchCriterias'
import { Item } from 'components/ui/FilterListItems/ListItem'
import Button from 'components/ui/Button'
import { DeleteOutline } from '@mui/icons-material'
import { Grid, Typography } from '@mui/material'
import { useAppSelector } from 'state'
import { MeState } from 'state/me'

enum Mode {
  SINGLE,
  MULTIPLE
}

type FiltersListProps = {
  name?: string
  values: SavedFilter[]
  count: number
  onDelete: (value: any) => void
  onSelect: (filter: SavedFilter | null) => void
  onDisplay: () => void
  onEdit: () => void
  fetchPaginateData: () => void
}

const FiltersList = ({
  children,
  name,
  values,
  count,
  onDelete,
  onSelect,
  onDisplay,
  onEdit,
  fetchPaginateData
}: PropsWithChildren<FiltersListProps>) => {
  const context = useContext(FormContext)
  const [filters, setFilters] = useState<Item[]>([])
  const [mode, setMode] = useState(Mode.SINGLE)

  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const maintenanceIsActive = meState?.maintenance?.active

  const handleDeleteSelectedFilters = async (): Promise<void> => {
    const checkedFilterIdsToDelete = filters.filter((filter) => filter.checked).map((filter) => filter.id)
    onDelete(checkedFilterIdsToDelete)
  }

  useEffect(() => {
    context?.updateError(false)
    if (context?.updateError && mode === Mode.MULTIPLE) {
      context.updateError(true)
    }
    setFilters(filters.map((value) => ({ ...value, checked: false })))
  }, [mode])

  useEffect(() => {
    setFilters(
      values.map((value) => ({
        id: value.uuid,
        name: value.name,
        checked: filters.find((filter) => filter.id === value.uuid)?.checked || false
      }))
    )
  }, [values])

  useEffect(() => {
    context?.updateError(false)
    const selectedSavedFilter = values.find((filter) => filter.uuid === filters.find((filter) => filter.checked)?.id)
    if (name && selectedSavedFilter) context?.updateFormData(name, selectedSavedFilter)
    if (!selectedSavedFilter || mode === Mode.MULTIPLE) context?.updateError(true)
    onSelect(selectedSavedFilter || null)
  }, [filters])

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
          <Button
            width="60%"
            icon={<DeleteOutline />}
            color="error"
            onClick={() => {
              handleDeleteSelectedFilters()
              setMode(Mode.SINGLE)
            }}
            disabled={!filters.find((item) => item.checked)}
          >
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
          savedFiltersCount={count}
          onchange={(newFilters) => setFilters(newFilters)}
          onItemEyeClick={onDisplay}
          onItemPencilClick={onEdit}
          fetchPaginateData={fetchPaginateData}
        />
      ) : (
        <Typography fontWeight="700" align="center" sx={{ padding: '8px' }}>
          Aucun filtre n'a été enregistré
        </Typography>
      )}

      {children}
    </>
  )
}

export default FiltersList
