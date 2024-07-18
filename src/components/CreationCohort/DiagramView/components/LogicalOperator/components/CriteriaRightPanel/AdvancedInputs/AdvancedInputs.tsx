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

import {
  CriteriaType,
  CriteriaTypesWithAdvancedInputs,
  SelectedCriteriaTypesWithAdvancedInputs
} from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import { DurationRangeType } from 'types/searchCriterias'
import { CriteriaLabel } from 'components/ui/CriteriaLabel'

type AdvancedInputsProps = {
  sourceType: SourceType
  selectedCriteria: SelectedCriteriaTypesWithAdvancedInputs
  onChangeValue: (key: string, value: ScopeElement[] | DurationRangeType | boolean | string | null | undefined) => void
  onError: (error: boolean) => void
}

const AdvancedInputs = ({ sourceType, selectedCriteria, onChangeValue, onError }: AdvancedInputsProps) => {
  const optionsIsUsed =
    (selectedCriteria.encounterService && selectedCriteria.encounterService.length > 0) ||
    !!selectedCriteria.startOccurrence ||
    !!selectedCriteria.endOccurrence ||
    selectedCriteria.encounterStartDate[0] !== null ||
    selectedCriteria.encounterStartDate[1] !== null ||
    selectedCriteria.encounterEndDate[0] !== null ||
    selectedCriteria.encounterEndDate[1] !== null

  const [checked, setChecked] = useState(optionsIsUsed)

  const _onSubmitExecutiveUnits = (_selectedExecutiveUnits: Hierarchy<ScopeElement, string>[]) => {
    onChangeValue('encounterService', _selectedExecutiveUnits)
  }

  const getOccurenceDateLabel = (
    selectedCriteriaType: Exclude<CriteriaTypesWithAdvancedInputs, CriteriaType.IMAGING>
  ) => {
    const mapping = {
      [CriteriaType.DOCUMENTS]: 'Date de création du document',
      [CriteriaType.CONDITION]: 'Date du diagnostic CIM10',
      [CriteriaType.PROCEDURE]: "Date de l'acte CCAM",
      [CriteriaType.CLAIM]: 'Date du classement en GHM',
      [CriteriaType.MEDICATION_REQUEST]: 'Date de prescription',
      [CriteriaType.MEDICATION_ADMINISTRATION]: "Date de début d'administration",
      [CriteriaType.OBSERVATION]: "Date de l'examen"
    }

    return mapping[selectedCriteriaType]
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
          <BlockWrapper style={{ margin: '1em 1em 2em', width: 'calc(100% - 2em)' }}>
            <CriteriaLabel>{getOccurenceDateLabel(selectedCriteria.type)}</CriteriaLabel>
            <CalendarRange
              inline
              value={[selectedCriteria?.startOccurrence, selectedCriteria?.endOccurrence]}
              onChange={([start, end]) => {
                onChangeValue('startOccurrence', start)
                onChangeValue('endOccurrence', end)
              }}
              onError={(isError) => onError(isError)}
            />
          </BlockWrapper>
        )}
      </Collapse>
    </Grid>
  )
}

export default AdvancedInputs
