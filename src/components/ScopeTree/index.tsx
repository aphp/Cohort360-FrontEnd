import React, { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'state'
import { ScopeElement } from 'types'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { Grid, Pagination, Paper } from '@mui/material'
import { useHierarchy } from '../../hooks/hierarchy/useHierarchy'
import servicesPerimeters from '../../services/aphp/servicePerimeters'
import SelectedCodes from './SelectedCodes'
import { useSearchParameters } from 'hooks/useSearchParameters'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'
import ScopeTreeTable from './ScopeTreeTable'
import { saveFetchedPerimeters, saveFetchedRights } from 'state/scope'
import { cleanNodes } from 'utils/hierarchy'

type ScopeTreeProps = {
  baseTree: Hierarchy<ScopeElement, string>[]
  selectedNodes: Hierarchy<ScopeElement, string>[]
  sourceType: SourceType
  onSelect: (selectedItems: Hierarchy<ScopeElement, string>[]) => void
}

const ScopeTree = ({ baseTree, selectedNodes, sourceType, onSelect }: ScopeTreeProps) => {
  const practitionerId = useAppSelector((state) => state.me)?.id || ''
  const codes = useAppSelector((state) =>
    sourceType === SourceType.ALL ? state.scope.codes.rights : state.scope.codes.perimeters
  )
  const dispatch = useAppDispatch()
  const { options, onChangeSearchInput, onChangePage, onChangeCount, onChangeSearchMode } = useSearchParameters()
  const fetchChildren = useCallback(
    async (ids: string) => {
      const { results } =
        sourceType === SourceType.ALL
          ? await servicesPerimeters.getRights({ practitionerId, ids, limit: -1, sourceType })
          : await servicesPerimeters.getPerimeters({ practitionerId, ids, limit: -1, sourceType })
      return results
    },
    [practitionerId, sourceType]
  )

  const fetchSearch = useCallback(
    async (search: string, page: number) => {
      const { results, count } =
        sourceType === SourceType.ALL
          ? await servicesPerimeters.getRights({ practitionerId, search, page, limit: options.limit, sourceType })
          : await servicesPerimeters.getPerimeters({ practitionerId, search, page, limit: options.limit, sourceType })
      onChangeCount(count)
      return results
    },
    [practitionerId, sourceType]
  )

  const handleSaveCodes = useCallback((codes: Hierarchy<ScopeElement, string>[]) => {
    if (sourceType === SourceType.ALL) dispatch(saveFetchedRights(cleanNodes(codes)))
    else dispatch(saveFetchedPerimeters(cleanNodes(codes)))
  }, [])

  const { hierarchy, selectedCodes, loadingStatus, selectAllStatus, search, expand, select, selectAll, deleteCode } =
    useHierarchy(baseTree, selectedNodes, codes, handleSaveCodes, fetchChildren)

  const handleSearch = (searchValue: string, page: number) => {
    if (searchValue === '') onChangeCount(baseTree.length)
    onChangeSearchInput(searchValue)
    onChangePage(page)
    onChangeSearchMode(searchValue !== '')
    search(searchValue, page, fetchSearch)
  }

  useEffect(() => {
    onSelect(cleanNodes(selectedCodes))
  }, [selectedCodes])

  return (
    <Grid container direction="column" wrap="nowrap" height="100%" overflow="hidden">
      <Grid container padding={'20px'}>
        <Grid container sx={{ marginBottom: '15px' }}>
          <SearchInput
            value={options.search}
            placeholder={'Rechercher'}
            onchange={(newValue) => handleSearch(newValue, 0)}
          />
        </Grid>
        <Grid container>
          <SelectedCodes values={selectedCodes} onDelete={deleteCode} />
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
          style={{ overflowX: 'auto' }}
        >
          <ScopeTreeTable
            loading={loadingStatus}
            selectAllStatus={selectAllStatus}
            sourceType={sourceType}
            searchMode={options.searchMode}
            hierarchy={hierarchy}
            onExpand={expand}
            onSelect={select}
            onSelectAll={selectAll}
          />
          {options.totalPages > 1 && (
            <Grid item alignSelf="bottom">
              <Paper elevation={5}>
                <Grid item container justifyContent="center" style={{ padding: '10px 40px' }}>
                  <Pagination
                    count={options.totalPages || 1}
                    color="primary"
                    onChange={(event, page: number) => handleSearch(options.search, page - 1)}
                    page={options.page + 1}
                  />
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ScopeTree
