import React, { useEffect } from 'react'
import { LoadingStatus, ScopeElement } from 'types'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { Grid, SxProps, Theme } from '@mui/material'
import SelectedCodes from '../Hierarchy/SelectedCodes'
import { SourceType } from 'types/scope'
import { Hierarchy, Mode } from 'types/hierarchy'
import ScopeTreeTable from './ScopeTreeTable'
import { useScopeTree } from 'hooks/scopeTree/useScopeTree'
import { Pagination } from 'components/ui/Pagination'
import { LIMIT_PER_PAGE } from 'hooks/search/useSearchParameters'
import { cleanNode } from 'utils/hierarchy'

type ScopeTreeProps = {
  baseTree: Hierarchy<ScopeElement>[]
  selectedNodes: Hierarchy<ScopeElement>[]
  sourceType: SourceType
  onSelect: (selectedItems: Hierarchy<ScopeElement>[]) => void
  sx?: SxProps<Theme>
}

const ScopeTree = ({ baseTree, selectedNodes, sourceType, onSelect, sx }: ScopeTreeProps) => {
  const {
    hierarchyData: { hierarchy, loadingStatus, selectAllStatus, selectedCodes },
    hierarchyActions: { expand, select },
    parametersData: { searchInput, mode },
    parametersActions: { onChangePage, onChangeSearchInput }
  } = useScopeTree(baseTree, selectedNodes, sourceType)

  useEffect(() => {
    onSelect(selectedCodes.map((e) => cleanNode(e)))
  }, [selectedCodes])

  return (
    <Grid
      container
      direction="column"
      wrap="nowrap"
      height={'calc(100% - 20px)'}
      overflow="hidden"
      justifyContent={'space-between'}
    >
      <Grid container padding={'24px 20px'}>
        <SearchInput value={searchInput} placeholder={'Rechercher'} onchange={onChangeSearchInput} />
      </Grid>
      <Grid container direction="column" wrap="wrap" height="100vh" overflow="auto" padding={'0px 20px'}>
        <Grid
          item
          container
          direction="column"
          justifyContent="space-between"
          wrap="nowrap"
          height="100%"
          style={{ overflow: 'hidden' }}
        >
          <ScopeTreeTable
            loading={loadingStatus}
            selectAllStatus={selectAllStatus}
            sourceType={sourceType}
            mode={mode}
            hierarchy={hierarchy}
            onExpand={expand}
            onSelect={select}
          />
        </Grid>
      </Grid>
      <Grid container direction={'column'} style={{ backgroundColor: 'transparent' }}>
        {loadingStatus.search === LoadingStatus.SUCCESS && hierarchy.count / LIMIT_PER_PAGE > 1 && (
          <Grid container justifyContent={'center'}>
            <Pagination
              count={Math.ceil(hierarchy.count / LIMIT_PER_PAGE)}
              currentPage={hierarchy.page}
              onPageChange={onChangePage}
              color="#0063AF"
              centered
            />
          </Grid>
        )}
        <SelectedCodes values={selectedCodes} onDelete={(code) => select(Mode.SELECT, false, [code])} sx={sx} />
      </Grid>
    </Grid>
  )
}

export default ScopeTree
