import React from 'react'
import { Chip, Grid } from '@mui/material'
import { FilterKeys, FilterValue } from 'types/searchCriterias'
import { v4 as uuidv4 } from 'uuid'

type Criteria = {
  value: FilterValue
  category: FilterKeys
  label: string
}

type CriteriasSectionProps = {
  value: Criteria[]
  onDelete: (category: FilterKeys, value: FilterValue) => void
}

const CriteriasSection = ({ value, onDelete }: CriteriasSectionProps) => {
  return (
    <>
      {value?.length > 0 && (
        <Grid item xs={12} container>
          {value
            .filter((filter) => filter.label)
            .map((filter) => (
              <Chip key={uuidv4()} label={filter.label} onDelete={() => onDelete(filter.category, filter.value)} />
            ))}
        </Grid>
      )}
    </>
  )
}

export default CriteriasSection
