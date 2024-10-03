import React from 'react'
import { Grid, Divider, Paper, Collapse, Typography, Pagination } from '@mui/material'
import Tabs from 'components/ui/Tabs'
import { LoadingStatus, TabType } from 'types'
import ReferencesParameters, { Type } from './References'
import ValueSetTable from './ValueSetTable'
import { Reference, SearchMode, SearchModeLabel } from 'types/searchValueSet'
import SelectedCodes from 'components/Hierarchy/SelectedCodes'
import SearchInput from 'components/ui/Searchbar/SearchInput'
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
    parameters: { refs, searchInput, onChangeReferences, onChangeSearchInput },
    hierarchy: { exploration, research, expand, select, deleteCode, selectAll, onFetchMore }
  } = useSearchValueSet(references)

  const tabs: TabType<SearchMode, SearchModeLabel>[] = [
    { id: SearchMode.EXPLORATION, label: SearchModeLabel.EXPLORATION },
    { id: SearchMode.RESEARCH, label: SearchModeLabel.RESEARCH }
  ]

  return (
    <>
      <Grid container direction="column" wrap="nowrap" height="100%" overflow="hidden">
        <Grid container padding="30px 30px 20px 30px">
          <Grid item xs={12} marginBottom={'20px'}>
            <Tabs
              values={tabs}
              disabled={loadingStatus.init === LoadingStatus.FETCHING}
              active={tabs[mode]}
              onchange={onChangeMode}
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
                    <Typography color="#0063AF" variant="h3">
                      Rechercher un code :
                    </Typography>
                    <Grid height="42px" container alignItems="center">
                      <SearchInput
                        disabled={loadingStatus.search === LoadingStatus.FETCHING}
                        value={searchInput}
                        placeholder={'Rechercher un code'}
                        onchange={onChangeSearchInput}
                      />
                    </Grid>
                  </Collapse>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Grid container direction="column" wrap="wrap" height="100%" overflow="auto" padding={'0px 30px'}>
          <Displayer isDisplayed={mode === SearchMode.RESEARCH && loadingStatus.search === LoadingStatus.SUCCESS}>
            <Grid item paddingLeft="20px" marginBottom="10px">
              <Typography fontWeight={800} color="info" fontSize={14}>
                {research.count} résultat(s)
              </Typography>
            </Grid>
          </Displayer>
          <Grid
            item
            container
            direction="column"
            justifyContent="space-between"
            wrap="nowrap"
            height="92%"
            style={{ overflow: 'hidden' }}
          >
            <Displayer isDisplayed={mode === SearchMode.EXPLORATION}>
              <ValueSetTable
                isHierarchy={refs.find((ref) => ref.checked)?.isHierarchy}
                loading={{ list: loadingStatus.init, expand: loadingStatus.expand }}
                hierarchy={exploration}
                onFetchMore={() => onFetchMore(SearchMode.EXPLORATION)}
                onSelect={select}
                onSelectAll={selectAll}
                onExpand={expand}
              />
            </Displayer>
            <Displayer isDisplayed={mode === SearchMode.RESEARCH}>
              <ValueSetTable
                searchMode={true}
                onFetchMore={() => onFetchMore(SearchMode.RESEARCH)}
                loading={{ list: loadingStatus.search, expand: loadingStatus.expand }}
                hierarchy={research}
                onSelect={select}
                onSelectAll={selectAll}
                onExpand={expand}
              />
            </Displayer>
          </Grid>
        </Grid>
        {/*loadingStatus.search === LoadingStatus.SUCCESS && totalPages > 1 && (
          <Grid item alignSelf="bottom">
            <Paper elevation={5}>
              <Grid item container justifyContent="center" style={{ padding: '10px 40px' }}>
                <Pagination
                  count={totalPages || 1}
                  color="primary"
                  onChange={(event, page: number) => onChangePage(page - 1)}
                  page={page + 1}
                />
              </Grid>
            </Paper>
          </Grid>
        )*/}
        <div>
          <Paper sx={{ padding: '20px 30px', backgroundColor: '#D1E2F4' }}>
            <SelectedCodes values={selectedCodes} onDelete={deleteCode} />
          </Paper>
        </div>
      </Grid>
    </>
  )
}

export default SearchValueSet
