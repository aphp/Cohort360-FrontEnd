import React, { useEffect, useState } from 'react'

import {
  Checkbox,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Typography,
  IconButton
} from '@mui/material'
import { LoadingStatus } from 'types'
import { Hierarchy, HierarchyInfo, SearchMode, SelectedStatus } from 'types/hierarchy'
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  IndeterminateCheckBoxOutlined,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material'
import { CellWrapper, RowContainerWrapper, RowWrapper } from '../Hierarchy/styles'
import { sortArray } from 'utils/arrays'
import { v4 as uuidv4 } from 'uuid'
import { LIMIT_PER_PAGE } from 'hooks/search/useSearchParameters'
import { Pagination } from 'components/ui/Pagination'
import { getLabelFromCode, isDisplayedWithCode } from 'utils/valueSets'
import { FhirItem, ValueSetSortField, ValueSetSorting } from 'types/valueSet'
import TruncatedText from 'components/ui/TruncatedText'

const HEADER_NB_PATIENTS = 'Nb Patients'
const HEADER_FREQUENCY = 'Fréquence'

type ValueSetRowProps = {
  item: Hierarchy<FhirItem>
  loading: { expand: LoadingStatus; list: LoadingStatus }
  isSelectionDisabled: (node: Hierarchy<FhirItem>) => boolean
  path: string[]
  mode: SearchMode
  isHierarchy: boolean
  onExpand: (node: Hierarchy<FhirItem>) => void
  onSelect: (nodes: Hierarchy<FhirItem>[], toAdd: boolean, mode: SearchMode) => void
  isHeader?: boolean
}

const ValueSetRow = ({
  item,
  loading,
  isSelectionDisabled,
  path,
  mode,
  isHierarchy,
  onSelect,
  onExpand,
  isHeader = false
}: ValueSetRowProps) => {
  const [open, setOpen] = useState(false)
  const [internalLoading, setInternalLoading] = useState(false)
  const { label, subItems, status, id } = item

  const handleOpen = () => {
    setOpen(true)
    setInternalLoading(true)
    onExpand(item)
  }

  useEffect(() => {
    if (loading.expand === LoadingStatus.SUCCESS) setInternalLoading(false)
  }, [loading.expand])

  const displayStat = (stat: number | undefined, headerName: string) => {
    if (isHierarchy && isHeader) {
      return (
        <Typography variant="body2" fontWeight={600} color="#4f4f4f">
          {headerName}
        </Typography>
      )
    }
    return stat !== undefined ? stat.toLocaleString() : '-'
  }

  return (
    <>
      <RowContainerWrapper container color={path.length % 2 === 0 ? '#f3f5f9' : '#fff'}>
        <RowWrapper
          container
          alignItems="center"
          marginLeft={path.length > 1 ? path.length * 20 - 20 + 'px' : '0'}
          style={{ paddingRight: 10, width: '100%' }}
        >
          <CellWrapper size={1} cursor>
            {mode === SearchMode.EXPLORATION && isHierarchy && (
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
          <CellWrapper size={6} cursor onClick={() => (open ? setOpen(false) : handleOpen())}>
            <TruncatedText lineNb={2} text={getLabelFromCode(item)}></TruncatedText>
          </CellWrapper>
          <CellWrapper size={2} container sx={{ justifyContent: 'center' }}>
            <Typography variant="body2">{displayStat(item.statTotalUnique, HEADER_NB_PATIENTS)}</Typography>
          </CellWrapper>
          <CellWrapper size={2} container sx={{ justifyContent: 'center' }}>
            <Typography variant="body2">{displayStat(item.statTotal, HEADER_FREQUENCY)}</Typography>
          </CellWrapper>
          <CellWrapper size={1} container>
            <Checkbox
              disabled={isSelectionDisabled(item)}
              checked={status === SelectedStatus.SELECTED}
              indeterminate={status === SelectedStatus.INDETERMINATE}
              indeterminateIcon={<IndeterminateCheckBoxOutlined />}
              onChange={(event, checked) => onSelect([item], checked, SearchMode.EXPLORATION)}
              color="info"
              inputProps={{ 'aria-labelledby': label }}
            />
          </CellWrapper>
        </RowWrapper>
      </RowContainerWrapper>
      {!internalLoading &&
        open &&
        isHierarchy &&
        sortArray(subItems || [], isDisplayedWithCode(item.system) ? 'id' : 'label').map((subItem) => {
          return (
            <ValueSetRow
              mode={mode}
              isHierarchy={isHierarchy}
              isSelectionDisabled={isSelectionDisabled}
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
  hierarchy: HierarchyInfo<FhirItem>
  selectAllStatus: SelectedStatus
  loading: { expand: LoadingStatus; list: LoadingStatus }
  isHierarchy?: boolean
  mode: SearchMode
  isSelectionDisabled?: (node: Hierarchy<FhirItem>) => boolean
  onExpand: (node: Hierarchy<FhirItem>) => void
  onSelect: (nodes: Hierarchy<FhirItem>[], toAdd: boolean, mode: SearchMode) => void
  onSelectAll: (system: string, toAdd: boolean) => void
  onChangePage: (page: number) => void
  onSort?: (sorting: ValueSetSorting) => void
}

const ValueSetTable = ({
  hierarchy,
  selectAllStatus,
  loading,
  mode,
  isHierarchy = true,
  isSelectionDisabled = () => false,
  onSelect,
  onSelectAll,
  onExpand,
  onChangePage,
  onSort
}: ValueSetTableProps) => {
  const [currentSort, setCurrentSort] = useState<ValueSetSorting | null>(null)

  const handleSelect = (checked: boolean) => {
    if (mode === SearchMode.RESEARCH) {
      const notDisabled = hierarchy.tree.filter((node) => !isSelectionDisabled(node))
      onSelect(notDisabled, checked, SearchMode.RESEARCH)
    } else onSelectAll(hierarchy.system, checked)
  }

  const handleSort = (field: ValueSetSortField) => {
    if (!onSort) return

    let newOrder: 'asc' | 'desc' = 'desc'

    // If clicking the same field, toggle the order
    if (currentSort?.field === field) {
      newOrder = currentSort.order === 'desc' ? 'asc' : 'desc'
    }

    const newSort: ValueSetSorting = { field, order: newOrder }
    setCurrentSort(newSort)
    onSort(newSort)
  }

  const getSortIcon = (field: ValueSetSortField) => {
    if (currentSort?.field !== field) return null
    return currentSort.order === 'desc' ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />
  }

  return (
    <Grid
      container
      sx={{ flexDirection: 'column', justifyContent: 'space-between' }}
      height="100%"
      className="ValueSetTable"
    >
      <Grid container flexGrow={1}>
        <TableContainer style={{ background: 'white' }}>
          <Table>
            <TableHead>
              {loading.list === LoadingStatus.SUCCESS && !isHierarchy && (
                <RowContainerWrapper container>
                  <RowWrapper
                    container
                    sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                    style={{ paddingRight: 10 }}
                  >
                    <CellWrapper size={1} />
                    <CellWrapper size={6}>
                      <Typography color={hierarchy.count ? 'primary' : '#4f4f4f'} fontWeight={600}>
                        {hierarchy.count ? `${hierarchy.count} résultat(s)` : `Aucun résultat à afficher`}
                      </Typography>
                    </CellWrapper>
                    <CellWrapper size={2} container sx={{ justifyContent: 'center' }}>
                      {onSort && mode === SearchMode.RESEARCH ? (
                        <IconButton
                          size="small"
                          onClick={() => handleSort('statTotalUnique')}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Typography variant="body2" fontWeight={600} color="#4f4f4f">
                            {HEADER_NB_PATIENTS}
                          </Typography>
                          {getSortIcon('statTotalUnique')}
                        </IconButton>
                      ) : (
                        <Typography variant="body2" fontWeight={600} color="#4f4f4f">
                          {HEADER_NB_PATIENTS}
                        </Typography>
                      )}
                    </CellWrapper>
                    <CellWrapper size={2} container sx={{ justifyContent: 'center' }}>
                      {onSort && mode === SearchMode.RESEARCH ? (
                        <IconButton
                          size="small"
                          onClick={() => handleSort('statTotal')}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Typography variant="body2" fontWeight={600} color="#4f4f4f">
                            {HEADER_FREQUENCY}
                          </Typography>
                          {getSortIcon('statTotal')}
                        </IconButton>
                      ) : (
                        <Typography variant="body2" fontWeight={600} color="#4f4f4f">
                          {HEADER_FREQUENCY}
                        </Typography>
                      )}
                    </CellWrapper>
                    <CellWrapper size={1} container>
                      {hierarchy.count > 0 && (
                        <Checkbox
                          disabled={
                            mode === SearchMode.RESEARCH &&
                            !hierarchy.tree.filter((node) => !isSelectionDisabled(node)).length
                          }
                          checked={selectAllStatus === SelectedStatus.SELECTED}
                          indeterminate={selectAllStatus === SelectedStatus.INDETERMINATE}
                          indeterminateIcon={<IndeterminateCheckBoxOutlined style={{ color: 'rgba(0,0,0,0.6)' }} />}
                          onChange={(event, checked) => handleSelect(checked)}
                          style={{ paddingRight: 16 }}
                        />
                      )}
                    </CellWrapper>
                  </RowWrapper>
                </RowContainerWrapper>
              )}
            </TableHead>
            {loading.list === LoadingStatus.SUCCESS && (
              <TableBody>
                <div style={{ maxHeight: '20vh' }}>
                  {hierarchy.tree.map((item, index) =>
                    item ? (
                      <ValueSetRow
                        mode={mode}
                        loading={loading}
                        isHierarchy={isHierarchy}
                        path={[item.id]}
                        key={item.id}
                        item={item}
                        isSelectionDisabled={isSelectionDisabled}
                        onExpand={onExpand}
                        onSelect={onSelect}
                        isHeader={isHierarchy && index === 0}
                      />
                    ) : (
                      <h1 key={uuidv4()}>Missing</h1>
                    )
                  )}
                </div>
              </TableBody>
            )}
          </Table>
          {loading.list === LoadingStatus.FETCHING && (
            <Grid container sx={{ justifyContent: 'center', alignContent: 'center' }} height={500}>
              <CircularProgress />
            </Grid>
          )}
        </TableContainer>
      </Grid>
      <Grid container>
        {!isHierarchy && loading.list === LoadingStatus.SUCCESS && Math.ceil(hierarchy.count / LIMIT_PER_PAGE) > 1 && (
          <Pagination
            count={Math.ceil(hierarchy.count / LIMIT_PER_PAGE)}
            currentPage={hierarchy.page}
            onPageChange={onChangePage}
          />
        )}
      </Grid>
    </Grid>
  )
}

export default ValueSetTable
