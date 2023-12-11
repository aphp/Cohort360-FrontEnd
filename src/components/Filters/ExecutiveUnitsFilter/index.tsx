import { Grid, Tooltip, Typography } from '@mui/material'
import PopulationCard from 'components/CreationCohort/DiagramView/components/PopulationCard/PopulationCard'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { CriteriaNameType, ScopeTreeRow } from 'types'
import InfoIcon from '@mui/icons-material/Info'
import scopeType from 'data/scope_type.json'
import { InputWrapper } from 'components/ui/Inputs'

type ExecutiveUnitsFilterProps = {
  value: ScopeTreeRow[]
  name: string
  criteriaName: CriteriaNameType
  disabled?: boolean
}

const ExecutiveUnitsFilter = ({ name, value, criteriaName, disabled = false }: ExecutiveUnitsFilterProps) => {
  const context = useContext(FormContext)
  const [executiveUnits, setExecutiveUnits] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, executiveUnits)
  }, [executiveUnits])

  return (
    <InputWrapper>
      <Grid container alignContent="center">
        <Typography variant="h3" alignSelf="center">
          {' '}
          Unité exécutrice :
        </Typography>
        <Tooltip
          title={
            <>
              {(('- Le niveau hiérarchique de rattachement est : ' + scopeType?.criteriaType[criteriaName]) as string) +
                '.'}
              <br />
              {"- L'unité exécutrice" +
                ' est la structure élémentaire de prise en charge des malades par une équipe soignante ou médico-technique identifiées par leurs fonctions et leur organisation.'}
            </>
          }
        >
          <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
        </Tooltip>
      </Grid>

      <Grid item container direction="row" alignItems="center">
        <PopulationCard
          disabled={disabled}
          form={criteriaName}
          label="Sélectionner une unité exécutrice"
          title="Sélectionner une unité exécutrice"
          executiveUnits={executiveUnits}
          isAcceptEmptySelection={true}
          isDeleteIcon={true}
          onChangeExecutiveUnits={setExecutiveUnits}
        />
      </Grid>
    </InputWrapper>
  )
}

export default ExecutiveUnitsFilter
