import React from 'react'
import { Chip, Collapse, Divider, Grid, Tooltip } from '@mui/material'
import { FilterKeys, FilterValue, SearchCriteriaKeys } from 'types/searchCriterias'
import SaveFilter from './SaveFilter'
import Truncated from 'components/ui/Truncated'
import { useAppSelector } from 'state'

type Criteria = {
  value: FilterValue
  category: FilterKeys | SearchCriteriaKeys
  label: string
  disabled?: boolean
}

type CriteriasSectionProps = {
  value: Criteria[]
  onDelete: (category: FilterKeys | SearchCriteriaKeys, value: FilterValue) => void
  onSaveFilters: (name: string) => void
}

const CriteriasSection = ({ value, onDelete, onSaveFilters }: CriteriasSectionProps) => {
  const maintenanceIsActive = useAppSelector((state) => state.me)?.maintenance?.active

  const CustomChip = ({ value, category, label, disabled = false }: Criteria) => {
    return (
      <Chip
        label={label}
        disabled={disabled}
        onDelete={() => onDelete(category, value)}
        sx={{
          color: '#153d8A',
          '& .MuiChip-deleteIcon': {
            color: '#153d8A'
          }
        }}
      />
    )
  }
  return (
    <Grid item xs={12}>
      <Collapse in={value.length > 0}>
        <Grid container direction="column" gap="25px" justifyContent="flex-end">
          <Grid container item direction="row" xs={12} sm={5} lg={4} justifyContent="space-between">
            <Grid container item xs={12} sm={6} lg={8} />
            <Grid container item xs={12} sm={5} lg={4} gap={1} justifyContent="flex-end">
              <Grid container item xs={12} md={5} />
              <Grid container item xs={12} md={5}>
                {value.length > 0 && (
                  <Tooltip
                    title={maintenanceIsActive ? "Ce bouton est desactivé en raison d'une maintenance." : undefined}
                  >
                    <Grid container>
                      <SaveFilter onSubmit={onSaveFilters} disabled={maintenanceIsActive} />
                    </Grid>
                  </Tooltip>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} container>
            <Truncated values={value} component={CustomChip} gap="5px" maxHeight={220} />
          </Grid>
        </Grid>
        <Divider sx={{ marginTop: '25px' }} />
      </Collapse>
    </Grid>
  )
}

export default CriteriasSection
