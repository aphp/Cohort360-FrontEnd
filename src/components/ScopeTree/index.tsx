import React, { useEffect } from 'react'
import { ScopeElement } from 'types'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { Grid, Pagination, Paper } from '@mui/material'
import SelectedCodes from '../Hierarchy/SelectedCodes'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'
import ScopeTreeTable from './ScopeTreeTable'
import { cleanNodes } from 'utils/hierarchy/hierarchy'
import { useScopeTree } from 'hooks/scopeTree/useScopeTree'

type ScopeTreeProps = {
  baseTree: Hierarchy<ScopeElement, string>[]
  selectedNodes: Hierarchy<ScopeElement, string>[]
  sourceType: SourceType
  onSelect: (selectedItems: Hierarchy<ScopeElement, string>[]) => void
}

const ScopeTree = ({ baseTree, selectedNodes, sourceType, onSelect }: ScopeTreeProps) => {
  const {
    hierarchyData: { hierarchy, list, loadingStatus, selectAllStatus, selectedCodes },
    hierarchyActions: { expand, select, selectAll, deleteCode },
    parametersData: { page, searchInput, searchMode, totalPages },
    parametersActions: { onChangePage, onChangeSearchInput }
  } = useScopeTree(baseTree, selectedNodes, sourceType)

  useEffect(() => {
    onSelect(cleanNodes(selectedCodes))
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

        <Grid container direction="column" wrap="wrap" height="100%" overflow="auto">
          <Grid
            item
            container
            direction="column"
            justifyContent="space-between"
            wrap="nowrap"
            height="100%"
            overflow="auto"
            padding={'0px 20px'}
          >
            <ScopeTreeTable
              loading={loadingStatus}
              selectAllStatus={selectAllStatus}
              sourceType={sourceType}
              searchMode={searchMode}
              hierarchy={searchMode ? list : hierarchy}
              onExpand={expand}
              onSelect={select}
              onSelectAll={selectAll}
            />
          </Grid>
        </Grid>
        {totalPages > 1 && (
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
          <SelectedCodes values={selectedCodes} onDelete={deleteCode} />
        </Paper>
      </div>
    </>
  )
}

export default ScopeTree
