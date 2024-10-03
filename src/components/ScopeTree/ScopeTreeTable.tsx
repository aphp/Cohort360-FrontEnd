import React, { CSSProperties, Fragment, useEffect, useRef, useState } from 'react'
import {
  Breadcrumbs,
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
import { LoadingStatus, ScopeElement, SelectedStatus } from 'types'
import { Hierarchy, HierarchyInfo } from 'types/hierarchy'
import { IndeterminateCheckBoxOutlined, KeyboardArrowDown, KeyboardArrowRight, Mode } from '@mui/icons-material'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import displayDigit from 'utils/displayDigit'
import { CellWrapper, RowContainerWrapper } from '../Hierarchy/styles'
import { SourceType } from 'types/scope'
import { v4 as uuidv4 } from 'uuid'
import { isSourceTypeInScopeLevel } from 'utils/perimeters'
import { every } from 'lodash'
import { sortArray } from 'utils/arrays'
import InfiniteScroll from 'react-infinite-scroll-component'
import { VariableSizeList as List } from 'react-window'
import { LIMIT_PER_PAGE } from 'hooks/search/useSearchParameters'
import { SearchMode } from 'types/searchValueSet'

type HierarchyItemProps = {
  item: Hierarchy<ScopeElement, string>
  path: string[]
  mode: SearchMode
  sourceType: SourceType
  loading: { search: LoadingStatus; expand: LoadingStatus }
  onSelect: (node: Hierarchy<ScopeElement, string>, toAdd: boolean) => void
  onExpand: (node: Hierarchy<ScopeElement, string>) => void
}

const ScopeTreeRow = ({ item, path, sourceType, mode, loading, onSelect, onExpand }: HierarchyItemProps) => {
  const [open, setOpen] = useState(false)
  const [internalLoading, setInternalLoading] = useState(false)
  const { id, name, subItems, rights, status, source_value, type, cohort_size, full_path } = item
  const canExpand = !(
    subItems?.length === 0 ||
    (subItems && every(subItems, (item) => isSourceTypeInScopeLevel(sourceType, item.type) === false))
  )

  const handleOpen = () => {
    console.log("test clicked", subItems, open)
    setOpen(true)
    setInternalLoading(true)
    onExpand(item)
  }

  console.log("test open", open)

  useEffect(() => {
    if (loading.expand === LoadingStatus.SUCCESS) setInternalLoading(false)
  }, [loading.expand])

  return (
    <>
      <RowContainerWrapper
        container
        height="100%"
        alignItems="center"
        color={path.length % 2 === 0 ? '#f3f5f9' : '#fff'}
        marginLeft={path.length > 1 ? path.length * 20 - 20 + 'px' : '0'}
        fontSize={12}
        zIndex={10}
        position="relative"
        style={{ pointerEvents: 'auto' }}
      >
        <CellWrapper item xs={1} cursor>
          <>
            {internalLoading && <CircularProgress size={'15px'} color="info" />}
            {!internalLoading && (
              <>
                {open && <KeyboardArrowDown onClick={() => setOpen(false)} color="secondary" />}
                {!open && <KeyboardArrowRight onClick={handleOpen} color="secondary" />}
              </>
            )}
          </>
        </CellWrapper>

        {mode === SearchMode.RESEARCH && full_path && (
          <CellWrapper cursor item xs={5}>
            <Breadcrumbs maxItems={2}>
              {(full_path.split('/').length > 1 ? full_path.split('/').slice(1) : full_path.split('/').slice(0)).map(
                (full_path: string, index, arr) => {
                  const last = index === arr.length - 1
                  return (
                    <Typography
                      fontWeight={last ? 700 : 600}
                      fontSize={last ? 12.5 : 11.5}
                      color={last ? 'primary' : 'info'}
                      key={uuidv4()}
                    >
                      {full_path}
                    </Typography>
                  )
                }
              )}
            </Breadcrumbs>
          </CellWrapper>
        )}
        {mode === SearchMode.EXPLORATION && (
          <CellWrapper cursor item xs={5} onClick={() => (open ? setOpen(false) : handleOpen())}>
            <Typography fontWeight={700} fontSize={12.5} color="primary">
              {' '}
              {`${source_value} - ${name}`}
            </Typography>
          </CellWrapper>
        )}
        <CellWrapper item xs={2} textAlign="center">
          {displayDigit(+cohort_size)}
        </CellWrapper>
        {sourceType === SourceType.ALL && (
          <CellWrapper item xs={3} textAlign="center">
            {rights && <Fragment>{servicesPerimeters.getAccessFromRights(rights)}</Fragment>}
          </CellWrapper>
        )}
        {sourceType !== SourceType.ALL && (
          <CellWrapper item xs={3} textAlign="center">
            {type}
          </CellWrapper>
        )}
        <CellWrapper item xs={1}>
          <Checkbox
            checked={status === SelectedStatus.SELECTED}
            indeterminate={status === SelectedStatus.INDETERMINATE}
            color="secondary"
            indeterminateIcon={<IndeterminateCheckBoxOutlined />}
            onChange={(event, checked) => onSelect(item, checked)}
            inputProps={{ 'aria-labelledby': name }}
          />
        </CellWrapper>
      </RowContainerWrapper>
      {open &&
        sortArray(subItems || [], 'source_value').map((subItem: Hierarchy<ScopeElement, string>) => {
          console.log("test opzen")
          if (isSourceTypeInScopeLevel(sourceType, subItem.type)) {
            return (
              <ScopeTreeRow
                loading={loading}
                sourceType={sourceType}
                path={[...path, id]}
                mode={mode}
                key={subItem.id}
                item={subItem}
                onSelect={onSelect}
                onExpand={onExpand}
              />
            )
          }
        })}
    </>
  )
}

type ListItems = {
  data: Hierarchy<ScopeElement, string>[]
  index: number
  style: CSSProperties
}

type HierarchyProps = {
  hierarchy: HierarchyInfo<ScopeElement>
  mode: SearchMode
  selectAllStatus: SelectedStatus
  sourceType: SourceType
  loading: { search: LoadingStatus; expand: LoadingStatus }
  onExpand: (node: Hierarchy<ScopeElement, string>) => void
  onSelect: (node: Hierarchy<ScopeElement, string>, toAdd: boolean) => void
  onSelectAll: (toAdd: boolean) => void
  onFetchMore: () => void
}

const ScopeTreeTable = ({
  hierarchy,
  mode,
  selectAllStatus,
  sourceType,
  loading,
  onSelect,
  onSelectAll,
  onExpand,
  onFetchMore
}: HierarchyProps) => {
  return (
    <TableContainer style={{ overflowX: 'hidden', background: 'white' }}>
      <Table>
        <TableHead>
          <RowContainerWrapper alignItems="center" container color="#e1e1e1" height={'60px'}>
            <CellWrapper item xs={1}></CellWrapper>
            <CellWrapper item xs={5} color="#0063AF">
              Nom
            </CellWrapper>
            <CellWrapper item xs={2} textAlign="center" color="#0063AF">
              Nombre de patients
            </CellWrapper>
            <CellWrapper item xs={3} textAlign="center" color="#0063AF">
              {sourceType === SourceType.ALL ? 'Accès' : 'Type'}
            </CellWrapper>
            <CellWrapper item xs={1} container justifyContent="flex-end">
              <Checkbox
                color="secondary"
                checked={selectAllStatus === SelectedStatus.SELECTED}
                indeterminate={selectAllStatus === SelectedStatus.INDETERMINATE}
                indeterminateIcon={<IndeterminateCheckBoxOutlined style={{ color: 'rgba(0,0,0,0.6)' }} />}
                onChange={(event, checked) => onSelectAll(checked)}
              />
            </CellWrapper>
          </RowContainerWrapper>
        </TableHead>
        <TableBody>
          {loading.search === LoadingStatus.SUCCESS && !hierarchy.tree.length && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography>Aucun résultat à afficher</Typography>
              </TableCell>
            </TableRow>
          )}
          {loading.search !== LoadingStatus.FETCHING && (
            <List
              itemData={hierarchy.tree}
              innerElementType="div"
              itemCount={hierarchy.tree.length}
              itemSize={() => 70}
              height={700}
              width="100%"
              overscanCount={5}
            >
              {({ data, index, style }: ListItems) =>
                data[index] ? (
                  <div style={{ ...style, pointerEvents: 'none', zIndex: 1 }}>
                    <ScopeTreeRow
                      loading={loading}
                      path={[data[index].id]}
                      mode={mode}
                      key={data[index].id}
                      item={data[index]}
                      sourceType={sourceType}
                      onExpand={onExpand}
                      onSelect={onSelect}
                    />
                  </div>
                ) : (
                  <div style={style} key={index}>
                    Missing
                  </div>
                )
              }
            </List>
          )}
        </TableBody>
      </Table>
      {loading.search === LoadingStatus.FETCHING && (
        <Grid container justifyContent="center" alignContent="center" height={500}>
          <CircularProgress />
        </Grid>
      )}
    </TableContainer>
  )
}

/*<div id={scrollableUuid.current} style={{ maxHeight: '70vh', overflow: 'auto' }}>
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
                    <ScopeTreeRow
                      loading={loading}
                      path={[item.id]}
                      searchMode={searchMode}
                      key={item.id}
                      item={item}
                      sourceType={sourceType}
                      onExpand={onExpand}
                      onSelect={onSelect}
                    />
                  )
                })}
              </InfiniteScroll>
              </div>*/

export default ScopeTreeTable
