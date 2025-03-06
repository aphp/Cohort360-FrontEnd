import React, { useEffect } from 'react'
import { Grid } from '@mui/material'
import DisplayLocked from 'components/ui/Display/DisplayLocked'
import { Filters, SearchByTypes, SearchCriterias } from 'types/searchCriterias'
import Select from 'components/ui/Searchbar/Select'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { Controller, useForm } from 'react-hook-form'
import { AdditionalInfo, Search } from '../useExplorationBoard'
import { ResourceType } from 'types/requestCriterias'

export type SearchType = {
  searchCriterias: SearchCriterias<Filters>
}

type OccurrencesSearchProps = {
  search: Search
  infos: AdditionalInfo
  onChange: (searchCriterias: Search) => void
}

const OccurrencesSearch = ({ search, infos, onChange }: OccurrencesSearchProps) => {
  const { control, reset, watch, handleSubmit } = useForm({ defaultValues: search })

  useEffect(() => {
    reset(search)
  }, [search, reset])

  useEffect(() => {
    const subscription = watch(() => handleSubmit(onChange)())
    return () => subscription.unsubscribe()
  }, [handleSubmit, onChange, watch])

  return (
    <Grid container>
      {'searchBy' in search && (
        <Grid item xs={4}>
          <Controller
            name="searchBy"
            control={control}
            render={({ field }) => (
              <Select<SearchByTypes | undefined>
                value={search.searchBy}
                label="Rechercher dans :"
                options={infos.searchByList ?? []}
                onchange={field.onChange}
                radius={5}
              />
            )}
          />
        </Grid>
      )}
      <Grid item xs={'searchBy' in search ? 8 : 12}>
        {
          'searchInput' in search && (
            <Controller
              name="searchInput"
              control={control}
              render={({ field }) => (
                <SearchInput
                  {...field}
                  value={field.value ?? ''}
                  radius={5}
                  placeholder="Rechercher"
                  onchange={field.onChange}
                  displayHelpIcon={infos.type === ResourceType.DOCUMENTS}
                />
              )}
            />
          ) /*: (
          <DisplayLocked />
        )*/
        }
      </Grid>
    </Grid>
  )
}

export default OccurrencesSearch
