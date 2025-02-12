import React, { useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import Modal from 'components/ui/Modal'
import Text from 'components/ui/Inputs/Text'
import { SearchCriterias, SearchByTypes, Filters } from 'types/searchCriterias'
import { SelectedFilter } from 'hooks/filters/useSavedFilters'
import Select from 'components/ui/Searchbar/Select'
import { Controller, useForm } from 'react-hook-form'
import { AdditionalInfo } from '../useExplorationBoard'
import ExplorationFilters from '../Filters'
import { useAppSelector } from 'state'

type EditSavedFilterProps = {
  deidentified: boolean
  open: boolean
  criteria: SelectedFilter<Filters>
  infos: AdditionalInfo
  onEdit: (name: string, newSearchCriterias: SearchCriterias<Filters>, deidentified: boolean) => void
  onClose: () => void
}

const EditSavedFilter = ({ deidentified, open, criteria, infos, onEdit, onClose }: EditSavedFilterProps) => {
  const maintenanceIsActive = useAppSelector((state) => state.me)?.maintenance?.active
  const [isError, setIsError] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)
  const [form, setForm] = useState(criteria.filterParams.filters)
  const {
    control,
    watch,
    reset,
    formState: { isDirty, errors, isValid }
  } = useForm<{ filterName: string; searchInput: string; searchBy: SearchByTypes }>({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  const filterNameValue = watch('filterName')
  const searchBy = watch('searchBy')
  const searchInput = watch('searchInput')

  useEffect(() => {
    reset({
      filterName: criteria.filterName,
      searchBy: criteria.filterParams.searchBy,
      searchInput: criteria.filterParams.searchInput
    })
  }, [open, reset])

  return (
    <Modal
      open={open}
      isError={isError || !isValid}
      color="secondary"
      readonly={(!hasChanged && !isDirty) || maintenanceIsActive}
      onClose={onClose}
      onSubmit={() => {
        onEdit(filterNameValue, { ...criteria.filterParams, filters: form, searchBy, searchInput }, deidentified)
      }}
      submitText="Sauvegarder"
    >
      <Grid container direction="column" gap="8px">
        <Controller
          name="filterName"
          control={control}
          rules={{
            required: 'Ce champ est requis.',
            minLength: {
              value: 2,
              message: 'Le nom doit contenir au moins 2 caractères.'
            },
            maxLength: {
              value: 50,
              message: 'Le nom ne peut pas dépasser 50 caractères.'
            }
          }}
          render={({ field }) => (
            <Text
              {...field}
              label="Nom :"
              placeholder="Choisir un nom compris entre 2 et 50 caractères"
              errorMessage={errors.filterName?.message}
            />
          )}
        />
        {'searchInput' in criteria.filterParams && (
          <Controller
            name="searchInput"
            control={control}
            render={({ field }) => <Text {...field} label="Recherche textuelle :" />}
          />
        )}
        {'searchBy' in criteria.filterParams && (
          <Controller
            name="searchBy"
            control={control}
            render={({ field }) => (
              <Select<SearchByTypes | undefined>
                {...field}
                label="Rechercher dans"
                items={infos.searchByList ?? []}
                onchange={field.onChange}
                radius={5}
              />
            )}
          />
        )}
        <Grid>
          <ExplorationFilters
            infos={infos}
            filters={criteria.filterParams.filters}
            deidentified={deidentified}
            onSubmit={setForm}
            onChange={setHasChanged}
            onError={setIsError}
          />
        </Grid>
      </Grid>
    </Modal>
  )
}

export default EditSavedFilter
