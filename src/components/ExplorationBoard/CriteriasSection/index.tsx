import React from 'react'
import { Chip, Collapse, Divider, Grid, Tooltip } from '@mui/material'
import { FilterKeys, FilterValue, SearchCriteriaKeys } from 'types/searchCriterias'
import SaveFilter from './SaveFilter'
import Truncated from 'components/ui/Truncated'
import { useAppSelector } from 'state'
import { DisplayOptions, GAP } from 'types/exploration'

type Criteria = {
  value: FilterValue
  category: FilterKeys | SearchCriteriaKeys
  label: string
  disabled?: boolean
}

type CriteriasSectionProps = {
  value: Criteria[]
  displayOptions: DisplayOptions
  onDelete: (category: FilterKeys | SearchCriteriaKeys, value: FilterValue) => void
  onSaveFilters: (name: string) => void
}

const CriteriasSection = ({ value, displayOptions, onDelete, onSaveFilters }: CriteriasSectionProps) => {
  const maintenanceIsActive = useAppSelector((state) => state.me)?.maintenance?.active

  const CustomChip = ({ value, category, label, disabled = false }: Criteria) => {
    return (
      <Chip
        id={`criteria-${category}-${disabled ? 'disabled' : ''}`}
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
      <Divider sx={{ marginBottom: value.length ? GAP : 0 }} />
      <Collapse in={value.length > 0}>
        <Grid container direction="column" justifyContent="flex-end" gap={displayOptions.saveFilters ? GAP : 0}>
          {displayOptions.saveFilters && (
            <Grid container item direction="row" xs={12} sm={5} lg={4} justifyContent="space-between">
              <Grid container item xs={12} sm={6} lg={8} />
              <Grid container item xs={12} md={4} lg={4} justifyContent="flex-end">
                <Grid container item xs={12} lg={5} />
                <Grid container item xs={12} lg={5}>
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
          )}
          {displayOptions.criterias && (
            <Grid item xs={12} container>
              <Truncated values={value} component={CustomChip} gap="5px" maxHeight={220} />
            </Grid>
          )}
        </Grid>
        <Divider sx={{ marginTop: GAP }} />
      </Collapse>
    </Grid>
  )
}

export default CriteriasSection
