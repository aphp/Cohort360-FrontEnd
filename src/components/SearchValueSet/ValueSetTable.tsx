import React, { Fragment, useEffect, useRef, useState } from 'react'

import {
  Checkbox,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { LoadingStatus, SelectedStatus } from 'types'
import { FhirHierarchy, Hierarchy, HierarchyInfo } from 'types/hierarchy'
import { KeyboardArrowDown, KeyboardArrowRight, IndeterminateCheckBoxOutlined } from '@mui/icons-material'
import { CellWrapper, RowContainerWrapper, RowWrapper } from '../Hierarchy/styles'
import { sortArray } from 'utils/arrays'
import { v4 as uuidv4 } from 'uuid'
import InfiniteScroll from 'react-infinite-scroll-component'
import { LIMIT_PER_PAGE } from 'hooks/search/useSearchParameters'

type ValueSetRowProps = {
  item: Hierarchy<FhirHierarchy, string>
  loading: { expand: LoadingStatus; list: LoadingStatus }
  path: string[]
  searchMode: boolean
  isHierarchy: boolean
  onExpand: (node: Hierarchy<FhirHierarchy, string>) => void
  onSelect: (node: Hierarchy<FhirHierarchy, string>, toAdd: boolean) => void
}

const ValueSetRow = ({ item, loading, path, searchMode, isHierarchy, onSelect, onExpand }: ValueSetRowProps) => {
  const [open, setOpen] = useState(false)
  const [internalLoading, setInternalLoading] = useState(false)
  const { label, subItems, status, id } = item
  const canExpand = !(subItems?.length === 0 || subItems)

  const handleOpen = () => {
    setOpen(true)
    setInternalLoading(true)
    onExpand(item)
  }

  useEffect(() => {
    if (loading.expand === LoadingStatus.SUCCESS) setInternalLoading(false)
  }, [loading.expand])

  return (
    <>
      <RowContainerWrapper container color={path.length % 2 === 0 ? '#f3f5f9' : '#fff'}>
        <RowWrapper container alignItems="center" marginLeft={path.length > 1 ? path.length * 30 - 30 + 'px' : '0'}>
          <CellWrapper item xs={1} cursor>
            {!searchMode && isHierarchy && (
              <>
                {internalLoading && <CircularProgress size={'15px'} color="info" />}
                {!internalLoading && (
                  <>
                    {open && <KeyboardArrowDown onClick={() => setOpen(false)} color="info" />}
                    {!open && <KeyboardArrowRight onClick={handleOpen} color="info" />}
                  </>
                )}
              </>
            )}
          </CellWrapper>
          <CellWrapper item xs={10} cursor onClick={() => (open ? setOpen(false) : handleOpen())}>
            {label}
          </CellWrapper>
          <CellWrapper item xs={1} container>
            <Checkbox
              checked={status === SelectedStatus.SELECTED}
              indeterminate={status === SelectedStatus.INDETERMINATE}
              indeterminateIcon={<IndeterminateCheckBoxOutlined />}
              onChange={(event, checked) => onSelect(item, checked)}
              color="info"
              inputProps={{ 'aria-labelledby': label }}
            />
          </CellWrapper>
        </RowWrapper>
      </RowContainerWrapper>
      {!internalLoading &&
        open &&
        isHierarchy &&
        sortArray(subItems || [], 'label').map((subItem) => {
          return (
            <ValueSetRow
              searchMode={searchMode}
              isHierarchy={isHierarchy}
              loading={loading}
              path={[...path, id]}
              key={subItem.id}
              item={subItem}
              onSelect={onSelect}
              onExpand={onExpand}
            />
          )
        })}
    </>
  )
}

type ValueSetTableProps = {
  hierarchy: HierarchyInfo<FhirHierarchy>
  loading: { expand: LoadingStatus; list: LoadingStatus }
  isHierarchy?: boolean
  searchMode?: boolean
  onExpand: (node: Hierarchy<FhirHierarchy, string>) => void
  onSelect: (node: Hierarchy<FhirHierarchy, string>, toAdd: boolean) => void
  onSelectAll: (toAdd: boolean) => void
  onFetchMore: () => void
}

const ValueSetTable = ({
  hierarchy,
  loading,
  searchMode = false,
  isHierarchy = true,
  onSelect,
  onExpand,
  onFetchMore
}: ValueSetTableProps) => {
  const scrollableUuid = useRef(uuidv4())
  return (
    <TableContainer style={{ background: 'white' }}>
      <Table>
        <TableHead />
        <TableBody style={{ height: '100%' }}>
          {loading.list === LoadingStatus.SUCCESS && !hierarchy.tree.length && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography>Aucun résultat à afficher</Typography>
              </TableCell>
            </TableRow>
          )}
          {loading.list !== LoadingStatus.FETCHING && (
            <div
              id={scrollableUuid.current}
              style={{ maxHeight: '70vh', overflow: 'auto' }}
            >
              <InfiniteScroll
                scrollableTarget={scrollableUuid.current}
                dataLength={hierarchy.tree.length}
                next={onFetchMore}
                hasMore={hierarchy.tree.length < hierarchy.count}
                scrollThreshold={0.9}
                loader={<Fragment />}
              >
                {hierarchy.tree.map((item) => {
                  if (!item) return <h1 key={uuidv4()}>Missing</h1>
                  return (
                    <ValueSetRow
                      searchMode={searchMode}
                      loading={loading}
                      isHierarchy={isHierarchy}
                      path={[item.id]}
                      key={item.id}
                      item={item}
                      onExpand={onExpand}
                      onSelect={onSelect}
                    />
                  )
                })}
              </InfiniteScroll>
            </div>
          )}
        </TableBody>
      </Table>
      {loading.list === LoadingStatus.FETCHING && (
        <Grid container justifyContent="center" alignContent="center" height={500}>
          <CircularProgress />
        </Grid>
      )}
    </TableContainer>
  )
}

export default ValueSetTable
