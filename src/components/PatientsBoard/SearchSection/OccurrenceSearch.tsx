import React, { useEffect } from 'react'
import { Grid } from '@mui/material'
import DisplayLocked from 'components/ui/Display/DisplayLocked'
import { SearchByTypes, searchByListPatients } from 'types/searchCriterias'
import Select from 'components/ui/Searchbar/Select'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { useForm } from 'hooks/useForm'

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
  const {
    inputs,
    inputs: { searchBy, searchInput },
    changeInput
  } = useForm(search)

  useEffect(() => onChange(inputs), [inputs])

  return (
    <>
      {!deidentified && (
        <>
          <Select
            value={searchBy}
            label="Rechercher dans :"
            width={'150px'}
            items={searchByListPatients}
            onchange={(newValue: SearchByTypes) => changeInput('searchBy', newValue)}
          />
          <SearchInput
            value={searchInput}
            placeholder="Rechercher"
            width={'70%'}
            onchange={(newValue) => changeInput('searchInput', newValue)}
          />
        </>
      )}
      {deidentified && (
        <Grid container justifyContent="flex-end">
          <DisplayLocked />
        </Grid>
      )}
    </>
  )
}

export default OccurrencesSearch
