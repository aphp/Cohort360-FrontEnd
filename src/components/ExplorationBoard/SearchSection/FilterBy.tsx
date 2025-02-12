import React, { useEffect, useState } from 'react'
import Modal from 'components/ui/Modal'
import { FilterList } from '@mui/icons-material'
import { Button } from '@mui/material'
import { AdditionalInfo } from '../useExplorationBoard'
import ExplorationFilters from '../Filters'
import { Filters } from 'types/searchCriterias'

type FilterByProps = {
  filters: Filters
  infos: AdditionalInfo
  deidentified?: boolean
  onSubmit: (filters: Filters) => void
}

const FilterBy = ({ filters, deidentified, infos, onSubmit }: FilterByProps) => {
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
          deidentified={deidentified}
          infos={infos}
          onError={setIsError}
          onSubmit={setForm}
          onChange={setHasChanged}
        />
      </Modal>
    </>
  )
}

export default FilterBy
