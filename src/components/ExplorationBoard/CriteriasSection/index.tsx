import React from 'react'
import { AccordionDetails, AccordionSummary, Grid, Tooltip, Typography } from '@mui/material'
import { FilterKeys, FilterValue, SearchCriteriaKeys } from 'types/searchCriterias'
import SaveFilter from './SaveFilter'
import Truncated from 'components/ui/Truncated'
import { useAppSelector } from 'state'
import { DisplayOptions, GAP } from 'types/exploration'
import AccordionWrapper from 'components/ui/Accordion'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { ChipWrapper } from 'components/ui/Chip/styles'

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
  onSaveFilters?: (name: string) => void
}

const CriteriasSection = ({ value, displayOptions, onDelete, onSaveFilters }: CriteriasSectionProps) => {
  const maintenanceIsActive = useAppSelector((state) => state.me)?.maintenance?.active

  const CustomChip = ({ value, category, label, disabled = false }: Criteria) => {
    return (
      <ChipWrapper
        id={`criteria-${category}-${disabled ? 'disabled' : ''}`}
        label={label}
        disabled={disabled}
        onDelete={() => onDelete(category, value)}
        customVariant="filters"
      />
    )
  }
  return (
    <>
      {value.length > 0 && (
        <AccordionWrapper defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon htmlColor="#153D8A" />}>
            <Grid container justifyContent={'space-between'} alignItems={'center'} mr={2}>
              <Typography fontWeight={600} fontSize={16} color="#153D8A" fontFamily={"'Montserrat', sans-serif"}>
                Filtres sélectionnés ({value.length})
              </Typography>
              {displayOptions.saveFilters && onSaveFilters && value.length > 0 && (
                <Tooltip
                  title={maintenanceIsActive ? "Ce bouton est desactivé en raison d'une maintenance." : undefined}
                >
                  <SaveFilter onSubmit={onSaveFilters} disabled={maintenanceIsActive} />
                </Tooltip>
              )}
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container direction="column" justifyContent="flex-end" gap={displayOptions.saveFilters ? GAP : 0}>
              {displayOptions.criterias && (
                <Grid item xs={12} container>
                  <Truncated values={value} component={CustomChip} gap="5px" maxHeight={220} />
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </AccordionWrapper>
      )}
    </>
  )
}

export default CriteriasSection
