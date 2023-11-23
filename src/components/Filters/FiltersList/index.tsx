import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import ListItems from 'components/ui/ListItems'
import { SavedFilter } from 'types/searchCriterias'
import { Item } from 'components/ui/ListItems/ListItem'
import Button from 'components/ui/Button'
import { DeleteOutline } from '@mui/icons-material'
import { Grid, Typography } from '@mui/material'
import { deleteFiltersService } from 'services/aphp/servicePatients'

enum Mode {
  SINGLE,
  MULTIPLE
}

type FiltersListProps = {
  values: SavedFilter[]
  name: string
  onSubmit: (value: any) => void
}

const FiltersList = ({ name, values, onSubmit }: FiltersListProps) => {
  const context = useContext(FormContext)
  const [filters, setFilters] = useState<Item[]>(
    values.map((value) => {
      return { id: value.uuid, name: value.name, checked: false }
    })
  )

  const [mode, setMode] = useState(Mode.SINGLE)

  const handleSelectedFilter = (newFilters: Item[]) => {
    setFilters(newFilters)
  }

  const handleDeleteSelectedFilters = async () => {
    const checkedFilterIdsToDelete = filters.filter((filter) => filter.checked).map((filter) => filter.id)
    onSubmit(checkedFilterIdsToDelete)

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
        <>
          {mode === Mode.SINGLE && (
            <ListItems values={filters} onchange={(selectedItems: Item[]) => handleSelectedFilter(selectedItems)} />
          )}
          {mode === Mode.MULTIPLE && (
            <ListItems
              values={filters}
              multiple
              onchange={(selectedItems: Item[]) => handleSelectedFilter(selectedItems)}
            />
          )}
        </>
      ) : (
        <Typography fontWeight="700" align="center" sx={{ padding: '8px' }}>
          Aucun filtre n'a été enregistré
        </Typography>
      )}
    </>
  )
}

export default FiltersList
