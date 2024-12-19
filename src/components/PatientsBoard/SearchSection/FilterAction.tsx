import React, { useEffect, useState } from 'react'
import CheckboxGroup from 'components/ui/Inputs/CheckboxGroup'
import DurationRange from 'components/ui/Inputs/DurationRange'
import Modal from 'components/ui/Modal'
import { FilterKeys, Filters, genderOptions, vitalStatusesOptions } from 'types/searchCriterias'
import FilterList from 'assets/icones/filter.svg?react'
import { Button } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

type FilterActionProps = {
  filters: Filters
  deidentified?: boolean
  onSubmit: (filters: Filters) => void
}

const FilterAction = ({ filters, deidentified, onSubmit }: FilterActionProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, errors, isValid }
  } = useForm<Filters>({
    defaultValues: filters,
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  const [toggleModal, setToggleModal] = useState(false)

  useEffect(() => {
    reset(filters)
  }, [filters])

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
        readonly={!isDirty}
        color="secondary"
        isError={!isValid}
        onClose={() => setToggleModal(false)}
        onSubmit={handleSubmit((data) => {
          onSubmit(data)
          setToggleModal(false)
        })}
      >
        {FilterKeys.GENDERS in filters && (
          <Controller
            name={FilterKeys.GENDERS}
            control={control}
            render={({ field }) => <CheckboxGroup {...field} label="Genre :" options={genderOptions} />}
          />
        )}
        {FilterKeys.VITAL_STATUSES in filters && (
          <Controller
            name={FilterKeys.VITAL_STATUSES}
            control={control}
            render={({ field }) => <CheckboxGroup {...field} label="Statut vital :" options={vitalStatusesOptions} />}
          />
        )}
        {/*<DurationRange
          value={birthdatesRanges}
          label="Âge :"
          deidentified={deidentified ?? false}
          onChange={(value) => changeInput(FilterKeys.BIRTHDATES, value)}
          onError={changeFormError}
      />*/}
      </Modal>
    </>
  )
}

export default FilterAction
