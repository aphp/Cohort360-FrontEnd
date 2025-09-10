import React, { useEffect } from 'react'
import { Grid } from '@mui/material'
import { Filters, SearchByTypes, SearchCriterias } from 'types/searchCriterias'
import Select from 'components/ui/Searchbar/Select'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ResourceType } from 'types/requestCriterias'
import { AdditionalInfo, Search } from 'types/exploration'
import SearchbarWithCheck from 'components/ui/Searchbar/SearchbarWithChecks'

export type SearchType = {
  searchCriterias: SearchCriterias<Filters>
}

type OccurrencesSearchProps = {
  search: Search
  infos: AdditionalInfo
  onChange: (searchCriterias: Search) => void
}

const OccurrencesSearch = ({ search, infos, onChange }: OccurrencesSearchProps) => {
  const { control, reset, handleSubmit } = useForm({ defaultValues: search })

  useEffect(() => {
    reset(search)
  }, [search, reset])

  const searchBy = useWatch({ control, name: 'searchBy' })
  const searchInput = useWatch({ control, name: 'searchInput' })

  useEffect(() => {
    handleSubmit(onChange)()
  }, [searchBy, searchInput, handleSubmit, onChange])

  return (
    <Grid container size={12}>
      {'searchBy' in search && (
        <Grid size={4}>
          <Controller
            name="searchBy"
            control={control}
            render={({ field }) => (
              <Select<SearchByTypes | undefined>
                onChange={field.onChange}
                value={search.searchBy}
                label="Rechercher dans :"
                options={infos.searchByList ?? []}
                radius={16}
              />
            )}
          />
        </Grid>
      )}
      <Grid size={'searchBy' in search ? 8 : 12}>
        {infos.type !== ResourceType.DOCUMENTS && 'searchInput' in search && (
          <Controller
            name="searchInput"
            control={control}
            render={({ field }) => (
              <SearchInput {...field} value={field.value ?? ''} radius={16} placeholder="Rechercher" />
            )}
          />
        )}
        {infos.type === ResourceType.DOCUMENTS && 'searchInput' in search && (
          <Controller
            name="searchInput"
            control={control}
            render={({ field }) => (
              <SearchbarWithCheck {...field} radius={16} value={field.value ?? ''} placeholder="Rechercher" />
            )}
          />
        )}
      </Grid>
    </Grid>
  )
}

export default OccurrencesSearch
