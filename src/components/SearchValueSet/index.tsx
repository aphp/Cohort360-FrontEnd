import React, { useEffect } from 'react'
import { Grid, Paper, Collapse, Typography, Input, IconButton } from '@mui/material'
import Tabs from 'components/ui/Tabs'
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

type SearchValueSetProps = {
  references: Reference[]
  selectedNodes: Hierarchy<FhirItem>[]
  onSelect: (selectedItems: Hierarchy<FhirItem>[]) => void
}

const SearchValueSet = ({ references, selectedNodes, onSelect }: SearchValueSetProps) => {
  const {
    mode,
    searchInput,
    onChangeMode,
    onDelete,
    selectedCodes,
    isSelectionDisabled,
    loadingStatus,
    parameters: { refs, onChangeReferences, onChangeSearchInput, onChangePage },
    hierarchy: { exploration, research, selectAllStatus, expand, select, selectAll }
  } = useSearchValueSet(references, selectedNodes)

  const tabs: TabType<SearchMode, SearchModeLabel>[] = [
    { id: SearchMode.EXPLORATION, label: SearchModeLabel.EXPLORATION },
    { id: SearchMode.RESEARCH, label: SearchModeLabel.RESEARCH }
  ]

  useEffect(() => {
    onSelect(selectedCodes.map((e) => cleanNode(e)))
  }, [selectedCodes])

  return (
    <Grid
      container
      direction="column"
      wrap="nowrap"
      justifyContent={'space-between'}
      height={'100vh'}
      className="SearchValueSet"
    >
      <Grid container padding="30px 30px 8px 30px">
        <Grid item xs={12} marginBottom={'20px'}>
          <Tabs
            variant="pink"
            values={tabs}
            disabled={loadingStatus.init === LoadingStatus.FETCHING}
            active={tabs[mode]}
            onchange={(elem) => onChangeMode(elem.id)}
          />
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ padding: '20px' }}>
            <Grid container alignItems="center">
              <Grid item xs={6}>
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
              <Grid item xs={6}>
                <Collapse in={mode === SearchMode.RESEARCH && !!refs.find((ref) => ref.checked)}>
                  <Grid height="42px" container alignItems="center">
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
      <Grid container direction="column" wrap="nowrap" padding={'0px 30px'} height={'100%'}>
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
          />
        </Displayer>
      </Grid>
      <SelectedCodes values={selectedCodes} onDelete={onDelete} />
    </Grid>
  )
}

export default SearchValueSet
