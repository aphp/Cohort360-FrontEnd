import React, { useState } from 'react'

import { Collapse, FormLabel, Grid, IconButton, Typography } from '@mui/material'

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'
import { ScopeElement } from 'types'
import CalendarRange from 'components/ui/Inputs/CalendarRange'

import { CriteriaType, SelectedCriteriaTypesWithAdvancedInputs } from 'types/requestCriterias'
import { DurationRangeType } from 'types/searchCriterias'
import { CriteriaLabel } from 'components/ui/CriteriaLabel'
import { getOccurenceDateLabel } from 'utils/requestCriterias'
import ExecutiveUnitsInput from 'components/ui/Inputs/ExecutiveUnits'
import { InputWrapper } from 'components/ui/Inputs'

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

  const _onSubmitExecutiveUnits = (_selectedExecutiveUnits: Hierarchy<ScopeElement>[]) => {
    onChangeValue('encounterService', _selectedExecutiveUnits)
  }

  return (
    <Grid container>
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

      <Collapse in={checked} unmountOnExit style={{ width: '100%' }}>
        <Grid container direction="column" padding="0 1em" gap="10px">
          <InputWrapper>
            <ExecutiveUnitsInput
              sourceType={sourceType}
              value={selectedCriteria?.encounterService || []}
              onChange={_onSubmitExecutiveUnits}
            />
          </InputWrapper>

          <InputWrapper>
            <CriteriaLabel label="Prise en charge" infoIcon="Ne concerne pas les consultations" />
            <FormLabel style={{ fontWeight: 600, fontSize: 12 }} component="legend">
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
            <FormLabel style={{ fontWeight: 600, fontSize: 12 }} component="legend">
              Fin de prise en charge
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
          </InputWrapper>

          {selectedCriteria.type !== CriteriaType.IMAGING && (
            <>
              <InputWrapper>
                <CriteriaLabel label={getOccurenceDateLabel(selectedCriteria.type)} sx={{ paddingBottom: 0 }} />
                <CalendarRange
                  inline
                  value={selectedCriteria?.startOccurrence}
                  onChange={(newDate) => {
                    onChangeValue('startOccurrence', newDate)
                  }}
                  onError={(isError) => onError(isError)}
                />
              </InputWrapper>
              {selectedCriteria.type === CriteriaType.MEDICATION_REQUEST && (
                <InputWrapper>
                  <CriteriaLabel label={getOccurenceDateLabel(selectedCriteria.type, true)} sx={{ paddingBottom: 0 }} />
                  <CalendarRange
                    inline
                    value={selectedCriteria?.endOccurrence ?? [null, null]}
                    onChange={(newDate) => {
                      onChangeValue('endOccurrence', newDate)
                    }}
                    onError={(isError) => onError(isError)}
                  />
                </InputWrapper>
              )}
            </>
          )}
        </Grid>
      </Collapse>
    </Grid>
  )
}

export default AdvancedInputs
