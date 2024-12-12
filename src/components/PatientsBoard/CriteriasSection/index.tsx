import React from 'react'
import { Chip, Grid } from '@mui/material'
import { LabelObject } from 'types/searchCriterias'
import { v4 as uuidv4 } from 'uuid'

type CriteriasSectionProps = {
  value: LabelObject[]
  onDelete: () => void
}

const CriteriasSection = ({ value, onDelete }: CriteriasSectionProps) => {
  return (
    <>
      {value?.length > 0 && (
        <Grid item xs={12} container>
          {value
            .filter((filter) => filter.label)
            .map((filter) => (
              <Chip key={uuidv4()} label={filter.label} onDelete={onDelete} />
            ))}
        </Grid>
      )}
    </>
  )
}

export default CriteriasSection
