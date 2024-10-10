import React, { useEffect, useState } from 'react'

import {
  Checkbox,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from '@mui/material'
import { LoadingStatus, SelectedStatus } from 'types'
import { FhirHierarchy, Hierarchy, HierarchyInfo } from 'types/hierarchy'
import { KeyboardArrowDown, KeyboardArrowRight, IndeterminateCheckBoxOutlined } from '@mui/icons-material'
import { CellWrapper, RowContainerWrapper, RowWrapper } from '../Hierarchy/styles'
import { sortArray } from 'utils/arrays'
import { v4 as uuidv4 } from 'uuid'
import { SearchMode } from 'types/searchValueSet'
import { LIMIT_PER_PAGE } from 'hooks/search/useSearchParameters'
import { Pagination } from 'components/ui/Pagination'

type ValueSetRowProps = {
  item: Hierarchy<FhirHierarchy, string>
  loading: { expand: LoadingStatus; list: LoadingStatus }
  path: string[]
  mode: SearchMode
  isHierarchy: boolean
  onExpand: (node: Hierarchy<FhirHierarchy, string>) => void
  onSelect: (node: Hierarchy<FhirHierarchy, string>, toAdd: boolean) => void
}

const ValueSetRow = ({ item, loading, path, mode, isHierarchy, onSelect, onExpand }: ValueSetRowProps) => {
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
        <RowWrapper container alignItems="center" marginLeft={path.length > 1 ? path.length * 20 - 20 + 'px' : '0'}>
          <CellWrapper item xs={1} cursor>
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
              mode={mode}
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
  selectAllStatus: SelectedStatus
  loading: { expand: LoadingStatus; list: LoadingStatus }
  isHierarchy?: boolean
  mode: SearchMode
  onExpand: (node: Hierarchy<FhirHierarchy, string>) => void
  onSelect: (node: Hierarchy<FhirHierarchy, string>, toAdd: boolean) => void
  onSelectAll: (toAdd: boolean) => void
  onChangePage: (page: number) => void
}

const ValueSetTable = ({
  hierarchy,
  selectAllStatus,
  loading,
  mode,
  isHierarchy = true,
  onSelect,
  onSelectAll,
  onExpand,
  onChangePage
}: ValueSetTableProps) => {
  return (
    <Grid container direction="column" justifyContent="space-between">
      <Grid item>
        <TableContainer style={{ background: 'white' }}>
          <Table>
            <TableBody>
              {loading.list === LoadingStatus.SUCCESS && mode === SearchMode.RESEARCH && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Grid container alignItems="center" justifyContent="space-between">
                      <Typography color={hierarchy.count ? 'primary' : '#4f4f4f'} fontWeight={600}>
                        {hierarchy.count ? `${hierarchy.count} résultat(s)` : ` Aucun résultat à afficher`}
                      </Typography>
                      <Checkbox
                        color="secondary"
                        checked={selectAllStatus === SelectedStatus.SELECTED}
                        indeterminate={selectAllStatus === SelectedStatus.INDETERMINATE}
                        indeterminateIcon={<IndeterminateCheckBoxOutlined style={{ color: 'rgba(0,0,0,0.6)' }} />}
                        onChange={(event, checked) => onSelectAll(checked)}
                      />
                    </Grid>
                  </TableCell>
                </TableRow>
              )}
              {loading.list !== LoadingStatus.FETCHING && (
                <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
                  {hierarchy.tree.map((item) =>
                    item ? (
                      <ValueSetRow
                        mode={mode}
                        loading={loading}
                        isHierarchy={isHierarchy}
                        path={[item.id]}
                        key={item.id}
                        item={item}
                        onExpand={onExpand}
                        onSelect={onSelect}
                      />
                    ) : (
                      <h1 key={uuidv4()}>Missing</h1>
                    )
                  )}
                </div>
              )}
            </TableBody>
          </Table>
          {loading.list === LoadingStatus.FETCHING && (
            <Grid container justifyContent="center" alignContent="center" height={500}>
              <CircularProgress />
            </Grid>
          )}
          {!isHierarchy &&
            loading.list === LoadingStatus.SUCCESS &&
            Math.ceil(hierarchy.count / LIMIT_PER_PAGE) > 1 && (
              <Paper sx={{ padding: '20px 0px', position: 'absolute' }}>
                <Pagination
                  count={Math.ceil(hierarchy.count / LIMIT_PER_PAGE)}
                  currentPage={hierarchy.page}
                  onPageChange={onChangePage}
                  color="#0063AF"
                />
              </Paper>
            )}
        </TableContainer>
      </Grid>
    </Grid>
  )
}

export default ValueSetTable
