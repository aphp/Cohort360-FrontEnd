import React, { useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import CheckboxGroup from 'components/ui/Inputs/CheckboxGroup'
import Modal from 'components/ui/Modal'
import Text from 'components/ui/Inputs/Text'
import {
  genderOptions,
  vitalStatusesOptions,
  SearchCriterias,
  searchByListPatients,
  SearchByTypes
} from 'types/searchCriterias'
import { SelectedFilter } from 'hooks/filters/useSavedFilters'
/*import { useForm } from 'hooks/useForm'*/
import Select from 'components/ui/Searchbar/Select'
import DurationRange from 'components/ui/Inputs/DurationRange'
import { Controller, useForm } from 'react-hook-form'

type EditSavedFilterProps = {
  deidentified: boolean
  readonly?: boolean
  open: boolean
  criteria: SelectedFilter<DynamicFilters>
  disabled?: boolean
  onEdit: (name: string, newSearchCriterias: SearchCriterias<DynamicFilters>, deidentified: boolean) => void
  onClose: () => void
}

type DynamicFilters = {
  [key: string]: string[] // ou tout autre type selon vos données
}

export type DynamicSelectedFilter = SelectedFilter<DynamicFilters>

const EditSavedFilter = <T,>({
  deidentified,
  criteria,
  readonly = false,
  open,
  onEdit,
  onClose
}: EditSavedFilterProps) => {

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, errors, isValid }
  } = useForm<DynamicSelectedFilter>({
    defaultValues: criteria,
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  
  useEffect(() => {
    reset(criteria)
  }, [criteria, reset])

  return (
    <Modal
      open={open}
      isError={!isValid}
      color="secondary"
      readonly={readonly || !isDirty}
      onClose={onClose}
      onSubmit={handleSubmit((data) => onEdit(data.filterName, data.filterParams, deidentified ?? true))}
      submitText="Sauvegarder"
    >
      <Grid container direction="column" gap="8px">
        <Controller
          name="filterName"
          control={control}
          //defaultValue={criteria.filterName}
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
        {!deidentified && (
          <>
            <Controller
              name="filterParams.searchInput"
              control={control}
              render={({ field }) => <Text {...field} label="Recherche textuelle :" />}
            />
            <Controller
              name="filterParams.searchBy"
              control={control}
              render={({ field }) => (
                <Select<SearchByTypes | undefined>
                  value={field.value}
                  label="Rechercher dans"
                  items={searchByListPatients}
                  onchange={field.onChange}
                />
              )}
            />
          </>
        )}
        <Controller
          name="filterParams.filters.genders"
          control={control}
          render={({ field }) => (
            <CheckboxGroup {...field} disabled={readonly} label="Genre :" options={genderOptions} />
          )}
        />
        <Controller
          name="filterParams.filters.vitalStatuses"
          control={control}
          render={({ field }) => (
            <CheckboxGroup {...field} disabled={readonly} label="Statut vital :" options={vitalStatusesOptions} />
          )}
        />
        {/*<Controller
          name="filterParams.filters.birthdatesRanges"
          control={control}
          rules={{
            validate: (value) => {
              if (value[0] > value[1]) {
                return 'La date de début doit être antérieure à la date de fin.'
              }
              return true
            }
          }}
          render={({ field }) => (
            <DurationRange
              {...field}
              label="Âge :"
              deidentified={deidentified ?? false}
              // onError={changeFormError}
            />
          )}
          />*/}
      </Grid>
    </Modal>
  )
}

export default EditSavedFilter
