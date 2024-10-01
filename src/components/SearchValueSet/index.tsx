import React from 'react'
import { Grid, Divider, Paper, Collapse, Typography, Input } from '@mui/material'
import Tabs from 'components/ui/Tabs'
import { LoadingStatus, TabType } from 'types'
import ReferencesParameters, { Type } from './References'
import ValueSetTable from './ValueSetTable'
import { Reference, SearchMode, SearchModeLabel } from 'types/searchValueSet'
import SelectedCodes from 'components/Hierarchy/SelectedCodes'
import { useSearchValueSet } from 'hooks/valueSet/useSearchValueSet'
import { Displayer } from 'components/ui/Displayer/styles'

type SearchValueSetProps = {
  references: Reference[]
}

const SearchValueSet = ({ references }: SearchValueSetProps) => {
  const {
    mode,
    onChangeMode,
    selectedCodes,
    loadingStatus,
    parameters: { refs, onChangeReferences, onChangeSearchInput, onChangePage },
    hierarchy: { exploration, research, expand, select, deleteCode, selectAll }
  } = useSearchValueSet(references)

  const tabs: TabType<SearchMode, SearchModeLabel>[] = [
    { id: SearchMode.EXPLORATION, label: SearchModeLabel.EXPLORATION },
    { id: SearchMode.RESEARCH, label: SearchModeLabel.RESEARCH }
  ]

  return (
    <>
      <Grid container direction="column" wrap="nowrap" sx={{ overflow: 'hidden' }}>
        <Grid container padding="30px 30px 20px 30px">
          <Grid item xs={12} marginBottom={'20px'}>
            <Tabs
              values={tabs}
              disabled={loadingStatus.init === LoadingStatus.FETCHING}
              active={tabs[mode]}
              onchange={(elem) => onChangeMode(elem.id)}
            />
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ padding: '20px' }}>
              <Grid container alignItems="center">
                <Grid item xs={6}>
                  <Typography color="#0063AF" variant="h3">
                    Référentiels :
                  </Typography>
                  <ReferencesParameters
                    disabled={loadingStatus.init === LoadingStatus.FETCHING}
                    onSelect={onChangeReferences}
                    type={mode === SearchMode.EXPLORATION ? Type.SINGLE : Type.MULTIPLE}
                    values={refs}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Collapse in={mode === SearchMode.RESEARCH && !!refs.find((ref) => ref.checked)}>
                    <Grid height="42px" container alignItems="center">
                      <Input
                        placeholder="Rechercher un code"
                        disabled={loadingStatus.search === LoadingStatus.FETCHING}
                        fullWidth
                        onChange={(event) => onChangeSearchInput(event.target.value)}
                      />
                    </Grid>
                  </Collapse>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        <Grid container direction="column" wrap="nowrap" padding={'0px 30px'} sx={{ flexGrow: 1 }}>
          <Displayer isDisplayed={mode === SearchMode.EXPLORATION}>
            <ValueSetTable
              mode={SearchMode.EXPLORATION}
              isHierarchy={refs.find((ref) => ref.checked)?.isHierarchy}
              loading={{ list: loadingStatus.init, expand: loadingStatus.expand }}
              hierarchy={exploration}
              onSelect={select}
              onSelectAll={selectAll}
              onExpand={expand}
              onChangePage={onChangePage}
            />
          </Displayer>
          <Displayer isDisplayed={mode === SearchMode.RESEARCH}>
            <ValueSetTable
              mode={SearchMode.RESEARCH}
              isHierarchy={false}
              loading={{ list: loadingStatus.search, expand: loadingStatus.expand }}
              hierarchy={research}
              onSelect={select}
              onSelectAll={selectAll}
              onExpand={expand}
              onChangePage={onChangePage}
            />
          </Displayer>
        </Grid>
      </Grid>
      <div>
        <Paper sx={{ backgroundColor: '#D1E2F4', padding: '10px 30px' }}>
          <SelectedCodes values={selectedCodes} onDelete={deleteCode} />
        </Paper>
      </div>
    </>
  )
}

export default SearchValueSet
