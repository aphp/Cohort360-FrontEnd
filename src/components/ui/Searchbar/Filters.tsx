import React, { ReactNode, useState } from 'react'

import { FilterWrapper } from './styles'
import { Button } from '@mui/material'
import { PatientsFilters as PatientFiltersType } from 'types'
import FiltersModal from 'components/Filters/FiltersModal'

type FiltersProps = {
  label: string
  filters: PatientFiltersType
  icon: ReactNode
  width: string
  onChange: (newFilters: PatientFiltersType) => void
}

const Filters = ({ label, filters, icon, width, onChange }: FiltersProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <FilterWrapper id="DTTB_btn" width={width}>
        <Button variant="contained" disableElevation onClick={() => setOpen(true)} startIcon={icon}>
          {label}
        </Button>
      </FilterWrapper>
      {open && (
        <FiltersModal
          filters={filters as PatientFiltersType}
          onClose={() => setOpen(false)}
          onSubmit={() => setOpen(false)}
          onChange={onChange}
        />
      )}
    </>
  )
}

export default Filters
