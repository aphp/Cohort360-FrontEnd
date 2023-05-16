import React, { useState } from 'react'

import { Collapse, Grid, IconButton, Typography, FormLabel, Tooltip } from '@mui/material'

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import OccurrencesInputs from './OccurrencesInputs/OccurrencesInputs'
import VisitInputs from './VisitInputs/VisitInputs'
import PopulationCard from '../../../../PopulationCard/PopulationCard'
import { ScopeTreeRow } from 'types'
import InfoIcon from '@mui/icons-material/Info'
import scopeType from 'data/scope_type.json'

type AdvancedInputsProps = {
  form: 'cim10' | 'ccam' | 'ghm' | 'document' | 'medication' | 'biology'
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
}

const AdvancedInputs: React.FC<AdvancedInputsProps> = (props) => {
  const { form, selectedCriteria = {}, onChangeValue } = props
  const optionsIsUsed =
    +selectedCriteria.occurrence !== 1 ||
    selectedCriteria.occurrenceComparator !== '>=' ||
    !!selectedCriteria.startOccurrence ||
    !!selectedCriteria.endOccurrence ||
    !!selectedCriteria.encounterStartDate ||
    !!selectedCriteria.encounterEndDate

  const [checked, setCheck] = useState(optionsIsUsed)
  const label = 'Séléctionnez une unité exécutrice'

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
        <Grid item container direction="row" alignItems="center">
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

        <OccurrencesInputs form={form} selectedCriteria={selectedCriteria} onChangeValue={onChangeValue} />
      </Collapse>
    </Grid>
  )
}

export default AdvancedInputs
