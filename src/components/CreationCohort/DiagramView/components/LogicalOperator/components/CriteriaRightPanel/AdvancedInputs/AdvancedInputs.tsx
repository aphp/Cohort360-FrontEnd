import React, { useState } from 'react'

import { Collapse, FormLabel, Grid, IconButton, Tooltip, Typography } from '@mui/material'

import InfoIcon from '@mui/icons-material/Info'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'
import { ScopeElement } from 'types'
import CalendarRange from 'components/ui/Inputs/CalendarRange'

import { CriteriaType, SelectedCriteriaTypesWithAdvancedInputs } from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import { DurationRangeType } from 'types/searchCriterias'
import { CriteriaLabel } from 'components/ui/CriteriaLabel'
import { getOccurenceDateLabel } from 'utils/requestCriterias'

type AdvancedInputsProps = {
  sourceType: SourceType
  selectedCriteria: SelectedCriteriaTypesWithAdvancedInputs
  onChangeValue: (key: string, value: ScopeElement[] | DurationRangeType | boolean | string | null | undefined) => void
  onError: (error: boolean) => void
}

const AdvancedInputs = ({ sourceType, selectedCriteria, onChangeValue, onError }: AdvancedInputsProps) => {
  const optionsIsUsed =
    (selectedCriteria.encounterService && selectedCriteria.encounterService.length > 0) ||
    selectedCriteria.startOccurrence?.[0] !== null ||
    selectedCriteria.startOccurrence?.[1] !== null ||
    selectedCriteria.endOccurrence?.[0] !== null ||
    selectedCriteria.endOccurrence?.[1] !== null ||
    selectedCriteria.encounterStartDate[0] !== null ||
    selectedCriteria.encounterStartDate[1] !== null ||
    selectedCriteria.encounterEndDate[0] !== null ||
    selectedCriteria.encounterEndDate[1] !== null

  const [checked, setChecked] = useState(optionsIsUsed)

  const _onSubmitExecutiveUnits = (_selectedExecutiveUnits: Hierarchy<ScopeElement, string>[]) => {
    onChangeValue('encounterService', _selectedExecutiveUnits)
  }

  return (
    <Grid container direction="column">
      <Grid
        item
        container
        direction="row"
        alignItems="center"
        style={{ padding: '1em' }}
        onClick={() => setChecked(!checked)}
      >
        <Typography style={{ cursor: 'pointer' }} variant="h6">
          Options avancées
        </Typography>

        <IconButton size="small">
          {checked ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
        </IconButton>
      </Grid>

      <Collapse in={checked} unmountOnExit>
        <BlockWrapper style={{ margin: '1em 1em 2em', width: 'calc(100% - 2em)' }}>
          <ExecutiveUnitsFilter
            sourceType={sourceType}
            value={selectedCriteria?.encounterService || []}
            name="AdvancedInputs"
            onChange={_onSubmitExecutiveUnits}
            isCriterion
          />
        </BlockWrapper>

        <BlockWrapper style={{ margin: '1em 1em 2em', width: 'calc(100% - 2em)' }}>
          <CriteriaLabel>Prise en charge</CriteriaLabel>
          <FormLabel style={{ padding: '0 0 1em', fontWeight: 600, fontSize: 12 }} component="legend">
            Début de prise en charge
          </FormLabel>
          <CalendarRange
            inline
            value={selectedCriteria?.encounterStartDate}
            onChange={(newDate) => {
              onChangeValue('encounterStartDate', newDate)
            }}
            onError={(isError) => onError(isError)}
            includeNullValues={selectedCriteria.includeEncounterStartDateNull}
            onChangeIncludeNullValues={(includeNullValues) =>
              onChangeValue('includeEncounterStartDateNull', includeNullValues)
            }
          />

          <FormLabel
            style={{ padding: '1em 0', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center' }}
            component="legend"
          >
            Fin de prise en charge
            <Tooltip title={'Ne concerne pas les consultations'}>
              <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
            </Tooltip>
          </FormLabel>
          <CalendarRange
            inline
            value={selectedCriteria?.encounterEndDate}
            onChange={(newDate) => {
              onChangeValue('encounterEndDate', newDate)
            }}
            onError={(isError) => onError(isError)}
            includeNullValues={selectedCriteria.includeEncounterEndDateNull}
            onChangeIncludeNullValues={(includeNullValues) =>
              onChangeValue('includeEncounterEndDateNull', includeNullValues)
            }
          />
        </BlockWrapper>

        {selectedCriteria.type !== CriteriaType.IMAGING && (
          <>
            <BlockWrapper style={{ margin: '1em 1em 2em', width: 'calc(100% - 2em)' }}>
              <CriteriaLabel>{getOccurenceDateLabel(selectedCriteria.type)}</CriteriaLabel>
              <CalendarRange
                inline
                value={selectedCriteria?.startOccurrence}
                onChange={(newDate) => {
                  onChangeValue('startOccurrence', newDate)
                }}
                onError={(isError) => onError(isError)}
              />
            </BlockWrapper>
            {selectedCriteria.type === CriteriaType.MEDICATION_REQUEST && (
              <BlockWrapper style={{ margin: '1em 1em 2em', width: 'calc(100% - 2em)' }}>
                <CriteriaLabel>{getOccurenceDateLabel(selectedCriteria.type, true)}</CriteriaLabel>
                <CalendarRange
                  inline
                  value={selectedCriteria?.endOccurrence ?? [null, null]}
                  onChange={(newDate) => {
                    onChangeValue('endOccurrence', newDate)
                  }}
                  onError={(isError) => onError(isError)}
                />
              </BlockWrapper>
            )}
          </>
        )}
      </Collapse>
    </Grid>
  )
}

export default AdvancedInputs
