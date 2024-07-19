import { Chip, CircularProgress, Grid, IconButton, Tooltip, Typography } from '@mui/material'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { LoadingStatus, ScopeElement } from 'types'
import InfoIcon from '@mui/icons-material/Info'
import { InputWrapper } from 'components/ui/Inputs'
import EditIcon from '@mui/icons-material/Edit'
import { ExecutiveUnitsWrapper } from './styles'
import { SourceType } from 'types/scope'
import PopulationRightPanel from 'components/CreationCohort/DiagramView/components/PopulationCard/components/PopulationRightPanel'
import { Hierarchy } from 'types/hierarchy'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import { getScopeLevelBySourceType } from 'utils/perimeters'

type ExecutiveUnitsFilterProps = {
  value: Hierarchy<ScopeElement, string>[]
  sourceType: SourceType
  name: string
  disabled?: boolean
  onChange?: (value: Hierarchy<ScopeElement, string>[]) => void
}

const ExecutiveUnitsFilter = ({ name, value, sourceType, disabled = false, onChange }: ExecutiveUnitsFilterProps) => {
  const context = useContext(FormContext)
  const [population, setPopulation] = useState<Hierarchy<ScopeElement, string>[]>([])
  const [selectedPopulation, setSelectedPopulation] = useState<Hierarchy<ScopeElement, string>[]>(value)
  const [loading, setLoading] = useState(disabled ? LoadingStatus.SUCCESS : LoadingStatus.FETCHING)
  const [open, setOpen] = useState(false)

  const handleDelete = (id: string) => {
    const newSelectedPopulation = selectedPopulation.filter((item) => item.id !== id)
    setSelectedPopulation(newSelectedPopulation)
  }

  useEffect(() => {
    const handleFetchPopulation = async () => {
      const response = await servicesPerimeters.getPerimeters({ sourceType: SourceType.APHP })
      setPopulation(response.results)
      setLoading(LoadingStatus.SUCCESS)
    }
    if (!disabled) handleFetchPopulation()
  }, [])

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, selectedPopulation)
    if (onChange) onChange(selectedPopulation)
  }, [selectedPopulation])
  return (
    <InputWrapper>
      <Grid item container alignContent="center">
        <Typography variant="h3" alignSelf="center">
          Unité exécutrice :
        </Typography>
        <Tooltip
          title={
            <>
              {'- Le niveau hiérarchique de rattachement est : ' + getScopeLevelBySourceType(sourceType) + '.'}
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
        <ExecutiveUnitsWrapper>
          <Grid container>
            {!selectedPopulation.length && 'Sélectionner une unité exécutrice'}
            {selectedPopulation.map((unit) => (
              <Chip
                disabled={disabled}
                sx={{
                  fontWeight: 700,
                  fontSize: 11,
                  height: 25,
                  color: '#153D8A',
                  backgroundColor: 'rgba(0, 0, 0, 0.10)',
                  marginTop: '4px'
                }}
                key={unit.id}
                label={`${unit.source_value} - ${unit.name}`}
                onDelete={() => {
                  handleDelete(unit.id)
                }}
              />
            ))}
          </Grid>
          <IconButton onClick={() => setOpen(true)} disabled={disabled}>
            {loading === LoadingStatus.SUCCESS && <EditIcon />}
            {loading === LoadingStatus.FETCHING && <CircularProgress size={24} />}
          </IconButton>
        </ExecutiveUnitsWrapper>
        <PopulationRightPanel
          title="Sélectionner une unité exécutrice"
          open={open}
          population={population}
          selectedPopulation={selectedPopulation}
          sourceType={sourceType}
          onConfirm={(value) => {
            setSelectedPopulation(value)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      </Grid>
    </InputWrapper>
  )
}

export default ExecutiveUnitsFilter
