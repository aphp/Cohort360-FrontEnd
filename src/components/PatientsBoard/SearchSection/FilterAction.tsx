import React, { useState } from 'react'
import CheckboxGroup from 'components/ui/Inputs/CheckboxGroup'
import DurationRange from 'components/ui/Inputs/DurationRange'
import Modal from 'components/ui/Modal'
import { FilterKeys, Filters, genderOptions, vitalStatusesOptions } from 'types/searchCriterias'
import { useForm } from 'hooks/useForm'
import FilterList from 'assets/icones/filter.svg?react'
import { Button } from '@mui/material'

type FilterActionProps = {
  filters: Filters
  deidentified?: boolean
  onSubmit: (filters: Filters) => void
}

const FilterAction = ({ filters, deidentified, onSubmit }: FilterActionProps) => {
  const {
    inputs,
    inputs: { genders, vitalStatuses, birthdatesRanges },
    changeFormError,
    changeInput,
    hasErrors
  } = useForm(filters)
  const [toggleModal, setToggleModal] = useState(false)

  console.log('test criteria', filters, inputs)

  return (
    <>
      <Button
        size="small"
        fullWidth
        endIcon={<FilterList height="15px" fill="#FFF" />}
        variant="contained"
        onClick={() => setToggleModal(true)}
      >
        Filtrer
      </Button>
      <Modal
        title="Filtrer par :"
        open={toggleModal}
        color="secondary"
        isError={hasErrors}
        onClose={() => setToggleModal(false)}
        onSubmit={() => {
          onSubmit(inputs)
          setToggleModal(false)
        }}
      >
        <CheckboxGroup
          value={genders}
          label="Genre :"
          options={genderOptions}
          onChange={(value) => changeInput(FilterKeys.GENDERS, value)}
        />
        <CheckboxGroup
          value={vitalStatuses}
          label="Statut vital :"
          options={vitalStatusesOptions}
          onChange={(value) => changeInput(FilterKeys.VITAL_STATUSES, value)}
        />
        <DurationRange
          value={birthdatesRanges}
          label="Âge :"
          deidentified={deidentified ?? false}
          onChange={(value) => changeInput(FilterKeys.BIRTHDATES, value)}
          onError={changeFormError}
        />
      </Modal>
    </>
  )
}

export default FilterAction
