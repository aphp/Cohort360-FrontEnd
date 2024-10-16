import React, { useEffect } from 'react'
import { LoadingStatus, ScopeElement } from 'types'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { Grid, Paper } from '@mui/material'
import SelectedCodes from '../Hierarchy/SelectedCodes'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'
import ScopeTreeTable from './ScopeTreeTable'
import { useScopeTree } from 'hooks/scopeTree/useScopeTree'
import { Pagination } from 'components/ui/Pagination'
import { LIMIT_PER_PAGE } from 'hooks/search/useSearchParameters'

type ScopeTreeProps = {
  baseTree: Hierarchy<ScopeElement, string>[]
  selectedNodes: Hierarchy<ScopeElement, string>[]
  sourceType: SourceType
  onSelect: (selectedItems: Hierarchy<ScopeElement, string>[]) => void
}

const ScopeTree = ({ baseTree, selectedNodes, sourceType, onSelect }: ScopeTreeProps) => {
  const {
    hierarchyData: { hierarchy, loadingStatus, selectAllStatus, selectedCodes },
    hierarchyActions: { expand, select, selectAll, deleteCode },
    parametersData: { searchInput, mode },
    parametersActions: { onChangePage, onChangeSearchInput }
  } = useScopeTree(baseTree, selectedNodes, sourceType)

  useEffect(() => {
    onSelect(selectedCodes)
  }, [selectedCodes])

  return (
    <>
      <Grid container direction="column" wrap="nowrap" height="100%" overflow="hidden">
        <Grid container padding={'30px 20px'}>
          <Grid item xs={12}>
            <Paper sx={{ padding: '20px', backgroundColor: 'transparent' }}>
              <SearchInput value={searchInput} placeholder={'Rechercher'} onchange={onChangeSearchInput} />
            </Paper>
          </Grid>
        </Grid>
        <Grid container direction="column" wrap="wrap" height="100%" overflow="auto" padding={'0px 20px'}>
          <Grid
            item
            container
            direction="column"
            justifyContent="space-between"
            wrap="nowrap"
            height="100%"
            style={{ overflow: 'hidden' }}
          >
            <Grid>
              <ScopeTreeTable
                loading={loadingStatus}
                selectAllStatus={selectAllStatus}
                sourceType={sourceType}
                mode={mode}
                hierarchy={hierarchy}
                onExpand={expand}
                onSelect={select}
                onSelectAll={selectAll}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <div>
        {loadingStatus.search === LoadingStatus.SUCCESS && hierarchy.count / LIMIT_PER_PAGE > 1 && (
          <Paper sx={{ padding: '20px 0px' }}>
            <Pagination
              count={Math.ceil(hierarchy.count / LIMIT_PER_PAGE)}
              currentPage={hierarchy.page}
              onPageChange={onChangePage}
              color="#0063AF"
            />
          </Paper>
        )}
        <Paper sx={{ padding: '20px 30px', backgroundColor: '#D1E2F4' }}>
          <SelectedCodes values={selectedCodes} onDelete={deleteCode} />
        </Paper>
      </div>
    </>
  )
}

export default ScopeTree
