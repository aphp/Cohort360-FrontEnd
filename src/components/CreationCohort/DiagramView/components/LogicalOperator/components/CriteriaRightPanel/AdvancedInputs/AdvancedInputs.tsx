import React, { useState } from 'react'

import { Collapse, FormLabel, Grid, IconButton, Typography } from '@mui/material'

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'
import { ScopeElement } from 'types'
import CalendarRange from 'components/ui/Inputs/CalendarRange'

import {
  CcamDataType,
  Cim10DataType,
  CriteriaType,
  DocumentDataType,
  GhmDataType,
  ImagingDataType,
  MedicationDataType,
  ObservationDataType
} from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'

type AdvancedInputsProps = {
  sourceType: SourceType
  selectedCriteria:
    | CcamDataType
    | Cim10DataType
    | DocumentDataType
    | GhmDataType
    | MedicationDataType
    | ImagingDataType
    | ObservationDataType
  onChangeValue: (key: string, value: ScopeElement[] | string | null | undefined) => void
  onError: (error: boolean) => void
}

const AdvancedInputs = ({ sourceType, selectedCriteria, onChangeValue, onError }: AdvancedInputsProps) => {
  const optionsIsUsed =
    (selectedCriteria.encounterService && selectedCriteria.encounterService.length > 0) ||
    !!selectedCriteria.startOccurrence ||
    !!selectedCriteria.endOccurrence ||
    !!selectedCriteria.encounterStartDate ||
    !!selectedCriteria.encounterEndDate

  const [checked, setCheck] = useState(optionsIsUsed)

  const _onSubmitExecutiveUnits = (_selectedExecutiveUnits: Hierarchy<ScopeElement, string>[]) => {
    onChangeValue('encounterService', _selectedExecutiveUnits)
  }

  const getDateLabel = (selectedCriteriaType: CriteriaType) => {
    const mapping = {
      [CriteriaType.DOCUMENTS]: 'Date de création du document',
      [CriteriaType.CONDITION]: 'Date du diagnostic CIM10',
      [CriteriaType.PROCEDURE]: "Date de l'acte CCAM",
      [CriteriaType.CLAIM]: 'Date du classement en GHM',
      [CriteriaType.MEDICATION_REQUEST]: 'Date de prescription',
      [CriteriaType.MEDICATION_ADMINISTRATION]: "Date de début d'administration",
      [CriteriaType.OBSERVATION]: "Date de l'examen"
    }

    return mapping[
      selectedCriteriaType as
        | CriteriaType.DOCUMENTS
        | CriteriaType.CONDITION
        | CriteriaType.PROCEDURE
        | CriteriaType.CLAIM
        | CriteriaType.MEDICATION_REQUEST
        | CriteriaType.MEDICATION_ADMINISTRATION
        | CriteriaType.OBSERVATION
    ]
  }

  return (
    <Grid container direction="column">
      <Grid
        item
        container
        direction="row"
        alignItems="center"
        style={{ padding: '1em' }}
        onClick={() => setCheck(!checked)}
      >
        <Typography style={{ cursor: 'pointer' }} variant="h6">
          Options avancées
        </Typography>

        <IconButton size="small">
          {checked ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
        </IconButton>
      </Grid>

      <Collapse in={checked} unmountOnExit>
        <Grid container direction="row" alignItems="center" padding="0em 1em" color="rgba(0, 0, 0, 0.6)">
          <ExecutiveUnitsFilter
            sourceType={sourceType}
            value={selectedCriteria?.encounterService || []}
            name="AdvancedInputs"
            onChange={_onSubmitExecutiveUnits}
          />
        </Grid>

        <FormLabel style={{ padding: '1em 1em 0 1em' }} component="legend">
          Date de prise en charge
        </FormLabel>

        <BlockWrapper style={{ margin: '1em', width: 'calc(100% - 2em)' }}>
          <CalendarRange
            inline
            value={[selectedCriteria?.encounterStartDate, selectedCriteria?.encounterEndDate]}
            onChange={([start, end]) => {
              onChangeValue('encounterStartDate', start)
              onChangeValue('encounterEndDate', end)
            }}
            onError={(isError) => onError(isError)}
          />
        </BlockWrapper>

        {selectedCriteria.type !== CriteriaType.IMAGING && (
          <>
            <FormLabel style={{ padding: '1em 1em 0 1em' }} component="legend">
              {getDateLabel(selectedCriteria.type)}
            </FormLabel>

            <BlockWrapper style={{ margin: '1em', width: 'calc(100% - 2em)' }}>
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
          </>
        )}
      </Collapse>
    </Grid>
  )
}

export default AdvancedInputs
