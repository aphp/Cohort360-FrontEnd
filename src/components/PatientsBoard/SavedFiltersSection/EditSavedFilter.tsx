import React, { useState } from 'react'
import { Grid } from '@mui/material'
import CheckboxGroup from 'components/ui/Inputs/CheckboxGroup'
import Modal from 'components/ui/Modal'
import Text from 'components/ui/Inputs/Text'
import { genderOptions, vitalStatusesOptions, SearchCriterias, searchByListPatients } from 'types/searchCriterias'
import { SelectedFilter } from 'hooks/filters/useSavedFilters'
import { useForm } from 'hooks/useForm'
import Select from 'components/ui/Searchbar/Select'
import DurationRange from 'components/ui/Inputs/DurationRange'

type EditSavedFilterProps<T> = {
  deidentified: boolean
  readonly: boolean
  open: boolean
  criteria: SelectedFilter<T>
  disabled?: boolean
  onEdit: (name: string, newSearchCriterias: SearchCriterias<T>, deidentified: boolean) => void
}

const EditSavedFilter = <T,>({ deidentified, criteria, readonly, open, onEdit }: EditSavedFilterProps<T>) => {
  const [toggleInfoModal, setToggleInfoModal] = useState(open)
  const {
    inputs: {
      filterName,
      filterParams,
      filterParams: { orderBy, searchInput, searchBy, filters }
    },
    changeFormError,
    changeInput,
    hasErrors
  } = useForm<SelectedFilter<T>>(criteria)

  return (
    <Modal
      title={readonly ? 'Informations' : 'Modifier le filtre'}
      open={open}
      isError={hasErrors}
      color="secondary"
      readonly={readonly ?? false}
      onClose={() => setToggleInfoModal(false)}
      onSubmit={() => onEdit(filterName, filterParams, deidentified ?? true)}
      submitText="Sauvegarder"
    >
      <Grid container direction="column" gap="8px">
        <Grid item container direction="column">
          <Text
            value={filterName}
            label="Nom :"
            placeholder="Choisir un nom compris entre 2 et 50 caractères"
            minLimit={2}
            maxLimit={50}
            disabled={readonly}
            onError={changeFormError}
            onChange={(value) => changeInput('filterName', value)}
          />
        </Grid>
        {!deidentified && (
          <Grid item container direction="column" paddingBottom="8px">
            <Text
              label="Recherche textuelle :"
              disabled={readonly}
              value={searchInput}
              onChange={(value) => changeInput('filterParams', { searchInput: value, searchBy, orderBy, filters })}
            />
            {/*
              <Select
                label="Rechercher dans"
                disabled={readonly}
                value={searchBy}
                items={searchByListPatients}
                name="searchBy"
              />
        */}
          </Grid>
        )}
        <Grid item>
          <CheckboxGroup
            disabled={readonly}
            value={filters.genders}
            label="Genre :"
            options={genderOptions}
            onChange={(value) =>
              changeInput('filterParams', { searchInput, searchBy, orderBy, filters: { genders: value } })
            }
          />
          <CheckboxGroup
            disabled={readonly}
            value={filters.vitalStatuses}
            label="Statut vital :"
            options={vitalStatusesOptions}
            onChange={(value) =>
              changeInput('filterParams', { searchInput, searchBy, orderBy, filters: { vitalStatuses: value } })
            }
          />
          <DurationRange
            disabled={readonly}
            value={filters.birthdatesRanges}
            label="Âge :"
            deidentified={deidentified ?? false}
            onChange={(value) =>
              changeInput('filterParams', { searchInput, searchBy, orderBy, filters: { birthdatesRanges: value } })
            }
            onError={changeFormError}
          />
        </Grid>
      </Grid>
    </Modal>
  )
}

export default EditSavedFilter
