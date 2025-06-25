import React, { useState } from 'react'
import Modal from 'components/ui/Modal'
import { FilterList } from '@mui/icons-material'
import ExplorationFilters from '../Filters'
import { Filters } from 'types/searchCriterias'
import { AdditionalInfo } from 'types/exploration'
import Button from 'components/ui/Button'

type FilterByProps = {
  filters: Filters
  infos: AdditionalInfo
  onSubmit: (filters: Filters) => void
}

const FilterBy = <T,>({ filters, infos, onSubmit }: FilterByProps) => {
  const [toggleModal, setToggleModal] = useState(false)
  const [isError, setIsError] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)
  const [form, setForm] = useState(filters)

  return (
    <>
      <Button
        size="small"
        sx={{ borderRadius: 8 }}
        startIcon={<FilterList height="15px" />}
        onClick={() => setToggleModal(true)}
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
