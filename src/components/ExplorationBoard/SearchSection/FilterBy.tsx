import React, { useState } from 'react'
import Modal from 'components/ui/Modal'
import { FilterList } from '@mui/icons-material'
import { Button } from '@mui/material'
import ExplorationFilters from '../Filters'
import { Filters } from 'types/searchCriterias'
import { AdditionalInfo } from 'types/exploration'

type FilterByProps<T> = {
  filters: T
  infos: AdditionalInfo
  onSubmit: (filters: T) => void
}

const FilterBy = <T,>({ filters, infos, onSubmit }: FilterByProps<T>) => {
  const [toggleModal, setToggleModal] = useState(false)
  const [isError, setIsError] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)
  const [form, setForm] = useState(filters)

  return (
    <>
      <Button
        size="small"
        sx={{ borderRadius: 1 }}
        fullWidth
        startIcon={<FilterList height="15px" fill="#0288D1" />}
        variant="contained"
        onClick={() => setToggleModal(true)}
        style={{ backgroundColor: '#fff', color: '#303030', height: '30px' }}
      >
        Filtrer
      </Button>
      <Modal
        title="Filtrer par :"
        open={toggleModal}
        readonly={!hasChanged}
        color="secondary"
        isError={isError}
        onClose={() => setToggleModal(false)}
        onSubmit={() => {
          onSubmit(form)
          setToggleModal(false)
        }}
      >
        <ExplorationFilters
          filters={filters}
          infos={infos}
          onError={setIsError}
          onChange={setForm}
          hasChanged={setHasChanged}
        />
      </Modal>
    </>
  )
}

export default FilterBy
