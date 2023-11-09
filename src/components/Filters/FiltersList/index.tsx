import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import ListItems from 'components/ui/ListItems'
import { SavedFilter } from 'types/searchCriterias'
import { Item } from 'components/ui/ListItems/ListItem'
import Button from 'components/ui/Button'
import { DeleteOutline } from '@mui/icons-material'
import { Grid, Typography } from '@mui/material'

enum Mode {
  SINGLE,
  MULTIPLE
}

type FiltersListProps = {
  values: SavedFilter[]
  name: string
}

const FiltersList = ({ name, values }: FiltersListProps) => {
  const context = useContext(FormContext)
  const [selectedFilter, setSelectedFilter] = useState<Item | null>(null)
  const [filters, setFilters] = useState<Item[]>(
    values.map((value) => {
      return { id: value.uuid, name: value.name, checked: false }
    })
  )

  const [mode, setMode] = useState(Mode.SINGLE)

  const handleSelectedFilter = (newFilters: Item[]) => {
    /* const newItems = filters.map((filter) => {
      return { ...filter, checked: filter.id === newFilter.id }
    })*/
    setFilters(newFilters)
    // setSelectedFilter(newFilter)
  }

  useEffect(() => {
    if (context?.updateFormData) {
      const matched = values.find((filter) => filter.uuid === (selectedFilter?.id ?? null)) || null
      if (matched) {
        if (context?.updateFormData) context.updateFormData(name, matched.filter)
      }
    }
  }, [selectedFilter])

  useEffect(() => {
    context?.updateError(false)
    if (context?.updateError && mode === Mode.MULTIPLE) {
      context.updateError(true)
    }
    setFilters(
      values.map((value) => {
        return { id: value.uuid, name: value.name, checked: false }
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
          <Button width="60%" icon={<DeleteOutline />} color="error" onClick={() => console.log('delete filters')}>
            Confirmer
          </Button>
          <Button variant="text" color="error" width="40%" onClick={() => setMode(Mode.SINGLE)}>
            <Typography fontWeight="700">Annuler</Typography>
          </Button>
        </Grid>
      )}
      {mode === Mode.SINGLE && (
        <ListItems values={filters} onchange={(selectedItem: Item[]) => handleSelectedFilter(selectedItem)} />
      )}
      {mode === Mode.MULTIPLE && (
        <ListItems values={filters} multiple onchange={(selectedItem: Item[]) => handleSelectedFilter(selectedItem)} />
      )}
    </>
  )
}

export default FiltersList
