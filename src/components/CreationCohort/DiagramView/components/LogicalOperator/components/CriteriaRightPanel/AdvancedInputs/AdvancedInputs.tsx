import React, { useState } from 'react'

import { Collapse, FormLabel, Grid, IconButton, Tooltip, Typography } from '@mui/material'

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import InfoIcon from '@mui/icons-material/Info'

import PopulationCard from 'components/CreationCohort/DiagramView/components/PopulationCard/PopulationCard'
import VisitInputs from './VisitInputs/VisitInputs'
import { CriteriaName } from 'types'
import OccurrencesDateInputs from './OccurrencesInputs/OccurrencesDateInputs'

import scopeType from 'data/scope_type.json'

import { ScopeTreeRow } from 'types'
import {
  CcamDataType,
  Cim10DataType,
  DocumentDataType,
  GhmDataType,
  ImagingDataType,
  MedicationDataType,
  ObservationDataType
} from 'types/requestCriterias'

type AdvancedInputsProps = {
  form: CriteriaName
  selectedCriteria:
    | CcamDataType
    | Cim10DataType
    | DocumentDataType
    | GhmDataType
    | MedicationDataType
    | ImagingDataType
    | ObservationDataType
  onChangeValue: (key: string, value: ScopeTreeRow[] | string | undefined) => void
}

const AdvancedInputs: React.FC<AdvancedInputsProps> = (props) => {
  const { form, selectedCriteria, onChangeValue } = props
  const optionsIsUsed =
    (selectedCriteria.encounterService && selectedCriteria?.encounterService.length > 0) ||
    !!selectedCriteria?.startOccurrence ||
    !!selectedCriteria?.endOccurrence ||
    !!selectedCriteria?.encounterStartDate ||
    !!selectedCriteria?.encounterEndDate

  const [checked, setCheck] = useState(optionsIsUsed)
  const label = 'Sélectionnez une unité exécutrice'

  const _onSubmitExecutiveUnits = (_selectedExecutiveUnits: ScopeTreeRow[] | undefined) => {
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
        <FormLabel style={{ padding: '1em 1em 0 1em', display: 'flex', alignItems: 'center' }} component="legend">
          Unité exécutrice
          <Tooltip
            title={
              <>
                {'- Le niveau hiérarchique de rattachement est : ' + scopeType?.criteriaType[form] + '.'}
                <br />
                {"- L'unité exécutrice" +
                  ' est la structure élémentaire de prise en charge des malades par une équipe soignante ou médico-technique identifiées par leurs fonctions et leur organisation.'}
              </>
            }
          >
            <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
          </Tooltip>
        </FormLabel>
        <Grid item container direction="row" alignItems="center" margin="1em">
          <PopulationCard
            form={form}
            label={label}
            title={label}
            executiveUnits={selectedCriteria?.encounterService ?? []}
            isAcceptEmptySelection={true}
            isDeleteIcon={true}
            onChangeExecutiveUnits={_onSubmitExecutiveUnits}
          />
        </Grid>

        <VisitInputs selectedCriteria={selectedCriteria} onChangeValue={onChangeValue} />
        <OccurrencesDateInputs selectedCriteria={selectedCriteria} onChangeValue={onChangeValue} />
      </Collapse>
    </Grid>
  )
}

export default AdvancedInputs
