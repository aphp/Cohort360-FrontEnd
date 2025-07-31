import React, { useEffect } from 'react'
import { Grid, Paper, Collapse, Typography, Input, IconButton, Tab } from '@mui/material'
import { LoadingStatus, TabType } from 'types'
import ReferencesParameters, { Type } from './References'
import ValueSetTable from './ValueSetTable'
import { FhirItem, Reference } from 'types/valueSet'
import SelectedCodes from 'components/Hierarchy/SelectedCodes'
import { useSearchValueSet } from 'hooks/valueSet/useSearchValueSet'
import { Displayer } from 'components/ui/Displayer/styles'
import ClearIcon from '@mui/icons-material/Clear'
import { Hierarchy, SearchMode, SearchModeLabel } from 'types/hierarchy'
import { cleanNode } from 'utils/hierarchy'
import { useAppDispatch } from 'state'
import { setMessage } from 'state/message'
import { TabsWrapper } from 'components/ui/Tabs'

type SearchValueSetProps = {
  references: Reference[]
  selectedNodes: Hierarchy<FhirItem>[]
  onSelect: (selectedItems: Hierarchy<FhirItem>[]) => void
}

const SearchValueSet = ({ references, selectedNodes, onSelect }: SearchValueSetProps) => {
  const dispatch = useAppDispatch()
  const {
    mode,
    searchInput,
    onChangeMode,
    onDelete,
    onSort,
    selectedCodes,
    isSelectionDisabled,
    loadingStatus,
    parameters: { refs, onChangeReferences, onChangeSearchInput, onChangePage },
    hierarchy: { exploration, research, selectAllStatus, hasError, expand, select, selectAll }
  } = useSearchValueSet(references, selectedNodes)

  const tabs: TabType<SearchMode, SearchModeLabel>[] = [
    { id: SearchMode.EXPLORATION, label: SearchModeLabel.EXPLORATION },
    { id: SearchMode.RESEARCH, label: SearchModeLabel.RESEARCH }
  ]

  useEffect(() => {
    onSelect(selectedCodes.map((e) => cleanNode(e)))
  }, [selectedCodes])

  useEffect(() => {
    if (hasError)
      dispatch(
        setMessage({
          type: 'error',
          content: `Tous les codes n'ont pas été récupérés. Votre recherche peut être incomplète. Si l'erreur persiste, merci
              de contacter l'adresse support : id.recherche.support.dsn@aphp.fr'`
        })
      )
  }, [hasError, research, dispatch])

  return (
    <Grid
      container
      sx={{ flexDirection: 'column', flexWrap: 'nowrap', justifyContent: 'space-between' }}
      height={'100vh'}
      className="SearchValueSet"
    >
      <Grid container padding="30px 30px 8px 30px">
        <Grid size={12} marginBottom={'20px'}>
          <TabsWrapper
            customVariant="secondary"
            variant="fullWidth"
            value={mode}
            onChange={(_, elem) => onChangeMode(elem)}
          >
            {tabs.map((tab) => (
              <Tab sx={{ fontSize: 12 }} key={tab.id} label={tab.label} value={tab.id} />
            ))}
          </TabsWrapper>
        </Grid>
        <Grid size={12}>
          <Paper sx={{ padding: '20px' }}>
            <Grid container sx={{ alignItems: 'center' }}>
              <Grid size={6}>
                <Typography color="#0063AF" variant="h3">
                  Référentiels :
                </Typography>
                <ReferencesParameters
                  disabled={
                    loadingStatus.init === LoadingStatus.FETCHING ||
                    (mode === SearchMode.RESEARCH && loadingStatus.search === LoadingStatus.FETCHING)
                  }
                  onSelect={onChangeReferences}
                  type={mode === SearchMode.EXPLORATION ? Type.SINGLE : Type.MULTIPLE}
                  values={refs}
                />
              </Grid>
              <Grid size={6}>
                <Collapse in={mode === SearchMode.RESEARCH && !!refs.find((ref) => ref.checked)}>
                  <Grid height="42px" container sx={{ alignItems: 'center' }}>
                    <Input
                      value={searchInput}
                      placeholder="Rechercher un code"
                      disabled={loadingStatus.search === LoadingStatus.FETCHING}
                      fullWidth
                      onChange={(event) => onChangeSearchInput(event.target.value)}
                      endAdornment={
                        <IconButton onClick={() => onChangeSearchInput('')}>
                          <ClearIcon style={{ fill: '#6f6f6f', height: 18 }} />
                        </IconButton>
                      }
                    />
                  </Grid>
                </Collapse>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Grid container sx={{ flexDirection: 'column', flexWrap: 'nowrap' }} padding={'0px 30px'} height={'100%'}>
        <Displayer isDisplayed={mode === SearchMode.EXPLORATION} height="100%" className="ValueSetExploration">
          <ValueSetTable
            mode={SearchMode.EXPLORATION}
            isHierarchy={refs.find((ref) => ref.checked)?.isHierarchy}
            loading={{ list: loadingStatus.init, expand: loadingStatus.expand }}
            hierarchy={exploration}
            selectAllStatus={selectAllStatus}
            isSelectionDisabled={isSelectionDisabled}
            onSelect={select}
            onSelectAll={selectAll}
            onExpand={expand}
            onChangePage={onChangePage}
          />
        </Displayer>
        <Displayer isDisplayed={mode === SearchMode.RESEARCH} height={'100%'} className="ValueSetSearch">
          <ValueSetTable
            mode={SearchMode.RESEARCH}
            selectAllStatus={selectAllStatus}
            isHierarchy={false}
            loading={{ list: loadingStatus.search, expand: loadingStatus.expand }}
            hierarchy={research}
            isSelectionDisabled={isSelectionDisabled}
            onSelect={select}
            onSelectAll={selectAll}
            onExpand={expand}
            onChangePage={onChangePage}
            onSort={onSort}
          />
        </Displayer>
      </Grid>
      <SelectedCodes values={selectedCodes} onDelete={onDelete} />
    </Grid>
  )
}

export default SearchValueSet
