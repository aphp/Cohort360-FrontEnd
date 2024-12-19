import React, { useEffect } from 'react'
import { Grid } from '@mui/material'
import DisplayLocked from 'components/ui/Display/DisplayLocked'
import { SearchByTypes, searchByListPatients } from 'types/searchCriterias'
import Select from 'components/ui/Searchbar/Select'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { Controller, useForm, useWatch } from 'react-hook-form'

type SearchType = {
  searchBy: SearchByTypes
  searchInput: string
}

type OccurrencesSearchProps = {
  search: SearchType
  deidentified?: boolean
  onChange: (search: SearchType) => void
}

const OccurrencesSearch = ({ search, deidentified, onChange }: OccurrencesSearchProps) => {
  const { control } = useForm<SearchType>({ defaultValues: search })

  const watchedFields = useWatch({
    control
  })

  useEffect(() => onChange(watchedFields as SearchType), [watchedFields])

  return (
    <>
      {!deidentified && (
        <Grid container>
          <Grid item xs={12} md={4}>
            <Controller
              defaultValue={SearchByTypes.TEXT}
              name="searchBy"
              control={control}
              render={({ field }) => (
                <Select<SearchByTypes | undefined>
                  value={field.value}
                  label="Rechercher dans :"
                  items={searchByListPatients}
                  onchange={field.onChange}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Controller
              defaultValue=""
              name="searchInput"
              control={control}
              render={({ field }) => <SearchInput {...field} placeholder="Rechercher" onchange={field.onChange} />}
            />
          </Grid>
        </Grid>
      )}
      {deidentified && (
        <Grid container>
          <DisplayLocked />
        </Grid>
      )}
    </>
  )
}

export default OccurrencesSearch
