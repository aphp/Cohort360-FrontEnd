import React, { useEffect, useState } from 'react'
import { Grid, Divider, Paper, Collapse, Typography, Pagination } from '@mui/material'
import Tabs from 'components/ui/Tabs'
import { LoadingStatus, TabType } from 'types'
import ReferencesParameters, { Type } from './References'
import ValueSetTable from './ValueSetTable'
import { Reference } from 'types/searchValueSet'
import SelectedCodes from 'components/Hierarchy/SelectedCodes'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { useSearchValueSet } from 'hooks/valueSet/useSearchValueSet'

enum SearchValueSetTab {
  HIERARCHY,
  RESEARCH
}

enum SearchValueSetTabLabel {
  HIERARCHY = 'Arborescence',
  RESEARCH = 'Recherche'
}

type SearchValueSetProps = {
  references: Reference[]
}

const SearchValueSet = ({ references }: SearchValueSetProps) => {
  const [activeTab, setActiveTab] = useState<TabType<SearchValueSetTab, SearchValueSetTabLabel>>({
    id: SearchValueSetTab.HIERARCHY,
    label: SearchValueSetTabLabel.HIERARCHY
  })
  const tabs: TabType<SearchValueSetTab, SearchValueSetTabLabel>[] = [
    { id: SearchValueSetTab.HIERARCHY, label: SearchValueSetTabLabel.HIERARCHY },
    { id: SearchValueSetTab.RESEARCH, label: SearchValueSetTabLabel.RESEARCH }
  ]

  const {
    /* hierarchyData: {
      hierarchies: { list, arboresence },
      loadingStatus,
      selectAllStatus,
      selectedCodes
    },
    hierarchyActions: { expand, select, selectAll, deleteCode },*/
    arborescences,
    parametersData: { count, page, searchInput, totalPages, refs },
    parametersActions: { onChangeRefs, onChangePage, onChangeSearchInput, onChangeSearchMode }
  } = useSearchValueSet(references)

  useEffect(() => {
    console.log('test arbo', arborescences)
  }, [arborescences])

  return (
    <>
      <Grid container direction="column" wrap="nowrap" height="100%" overflow="hidden">
        <Grid container padding="30px 30px 20px 30px">
          <Grid item xs={12} marginBottom={'20px'}>
            <Tabs
              values={tabs}
              active={activeTab}
              onchange={(value: TabType<SearchValueSetTab, SearchValueSetTabLabel>) => {
                setActiveTab(value)
                onChangeSearchMode(value.id === SearchValueSetTab.RESEARCH ? true : false)
              }}
            />
            <Divider />
          </Grid>

          {activeTab.id === SearchValueSetTab.HIERARCHY && (
            <Grid item xs={12}>
              <Paper sx={{ padding: '10px' }}>
                <ReferencesParameters
                  onSelect={onChangeRefs.arboresence}
                  type={Type.SINGLE}
                  values={refs.arboresence}
                />
              </Paper>
            </Grid>
          )}
          {activeTab.id === SearchValueSetTab.RESEARCH && (
            <>
              <Grid item xs={12} marginBottom={'20px'}>
                <Paper sx={{ padding: '10px' }}>
                  <ReferencesParameters onSelect={onChangeRefs.list} type={Type.MULTIPLE} values={refs.list} />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Collapse in={!!refs.list.find((ref) => ref.checked)}>
                  <Grid item marginBottom={'20px'}>
                    <Paper sx={{ padding: '10px' }}>
                      <SearchInput
                        value={searchInput}
                        placeholder={'Rechercher un code'}
                        onchange={onChangeSearchInput}
                      />
                    </Paper>
                  </Grid>
                </Collapse>
              </Grid>
            </>
          )}
        </Grid>

        <Grid container direction="column" wrap="wrap" height="100%" overflow="auto" padding={'0px 30px'}>
          {activeTab.id === SearchValueSetTab.RESEARCH && count! > 0 && (
            <Grid item paddingLeft="50px" marginBottom="10px">
              <Typography fontWeight={800} color="info" fontSize={14}>
                {count} résultat(s)
              </Typography>
            </Grid>
          )}
          <Grid
            item
            container
            direction="column"
            justifyContent="space-between"
            wrap="nowrap"
            height="92%"
            style={{ overflowX: 'auto' }}
          >
            {/*<ValueSetTable
                loading={loadingStatus}
                hierarchy={arboresence}
                onSelect={select}
                onSelectAll={selectAll}
                onExpand={expand}
            />*/}
            {/*activeTab.id === SearchValueSetTab.HIERARCHY && (
              <ValueSetTable
                loading={{ search: LoadingStatus.SUCCESS, expand: LoadingStatus.SUCCESS }}
                hierarchy={arborescense}
                onSelect={() => {}}
                onSelectAll={() => {}}
                onExpand={() => {}}
              />
            )*/}
            {/*activeTab.id === SearchValueSetTab.RESEARCH && (
              <ValueSetTable
                searchMode={true}
                loading={loadingStatus}
                hierarchy={list}
                onSelect={select}
                onSelectAll={selectAll}
                onExpand={expand}
              />
            )*/}
          </Grid>
        </Grid>
        {activeTab.id === SearchValueSetTab.RESEARCH && totalPages > 1 && (
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
        )}
      </Grid>
      <div>
        <Paper sx={{ padding: '20px 30px', backgroundColor: '#D1E2F4' }}>
          {/*<SelectedCodes values={selectedCodes} onDelete={deleteCode} />*/}
        </Paper>
      </div>
    </>
  )
}

export default SearchValueSet
