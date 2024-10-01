import { CircularProgress, FormLabel, Grid, IconButton, Tooltip } from '@mui/material'
import React, { ReactNode, useEffect, useState } from 'react'
import { LoadingStatus, ScopeElement } from 'types'
import InfoIcon from '@mui/icons-material/Info'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import { getScopeLevelBySourceType } from 'utils/perimeters'
import { CriteriaLabel } from 'components/ui/CriteriaLabel'
import ScopeTree from 'components/ScopeTree'
import Panel from 'components/ui/Panel'
import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import CodesWithSystems from 'components/Hierarchy/CodesWithSystems'
import { SearchOutlined } from '@mui/icons-material'
import { isEqual, sortBy } from 'lodash'

type ExecutiveUnitsProps = {
  value: Hierarchy<ScopeElement>[]
  sourceType: SourceType
  disabled?: boolean
  onChange: (value: Hierarchy<ScopeElement>[]) => void
  label?: ReactNode
}

const ExecutiveUnits = ({ value, sourceType, disabled = false, onChange, label }: ExecutiveUnitsProps) => {
  const [population, setPopulation] = useState<Hierarchy<ScopeElement>[]>([])
  const [confirmedPopulation, setConfirmedPopulation] = useState<Hierarchy<ScopeElement>[]>(value)
  const [loading, setLoading] = useState(disabled ? LoadingStatus.SUCCESS : LoadingStatus.FETCHING)
  const [open, setOpen] = useState(false)
  const [isExtended, setIsExtended] = useState(false)

  const handleDelete = (node: Hierarchy<ScopeElement>) => {
    const newSelectedPopulation = value.filter((item) => item.id !== node.id)
    onChange(newSelectedPopulation)
  }

  useEffect(() => {
    const handleFetchPopulation = async () => {
      const response = await servicesPerimeters.getPerimeters({ sourceType: SourceType.APHP })
      setPopulation(response.results)
      setLoading(LoadingStatus.SUCCESS)
    }
    if (!disabled) handleFetchPopulation()
  }, [])

  return (
    <InputWrapper>
      <Grid item container alignContent="center" alignItems={'center'}>
        {label || <CriteriaLabel style={{ padding: 0 }} label="Unité exécutrice" />}
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
      <Grid
        container
        alignItems={value.length ? 'flex-start' : 'center'}
        border="1px solid rgba(0, 0, 0, 0.25)"
        borderRadius="4px"
        padding="9px 3px 9px 12px"
      >
        <Grid container alignItems="center" item xs={10}>
          {!value.length && <FormLabel component="legend">Sélectionner une unité exécutrice</FormLabel>}
          <CodesWithSystems disabled={disabled} codes={value} isExtended={isExtended} onDelete={handleDelete} />
        </Grid>
        <Grid item xs={2} container justifyContent="flex-end">
          {value.length > 0 && isExtended && (
            <IconButton size="small" sx={{ color: '#5BC5F2' }} onClick={() => setIsExtended(false)}>
              <CloseIcon />
            </IconButton>
          )}
          {value.length > 0 && !isExtended && (
            <IconButton size="small" sx={{ color: '#5BC5F2' }} onClick={() => setIsExtended(true)}>
              <MoreHorizIcon />
            </IconButton>
          )}
          <IconButton
            sx={{ color: '#5BC5F2' }}
            size="small"
            onClick={() => {
              setOpen(true)
              setIsExtended(false)
            }}
            disabled={disabled}
          >
            {loading === LoadingStatus.FETCHING && <CircularProgress size={24} />}
            {loading === LoadingStatus.SUCCESS && <SearchOutlined />}
          </IconButton>
        </Grid>
      </Grid>
      <Panel
        mandatory={isEqual(sortBy(confirmedPopulation), sortBy(value))}
        title="Sélectionner une unité exécutrice"
        open={open}
        onConfirm={() => {
          onChange(confirmedPopulation)
          setOpen(false)
        }}
        onClose={() => setOpen(false)}
      >
        <ScopeTree
          baseTree={population}
          selectedNodes={value}
          onSelect={setConfirmedPopulation}
          sourceType={sourceType}
        />
      </Panel>
    </InputWrapper>
  )
}

export default ExecutiveUnits
