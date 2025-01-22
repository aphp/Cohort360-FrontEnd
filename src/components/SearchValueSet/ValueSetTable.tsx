import React, { useEffect, useState } from 'react'

import {
  Checkbox,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Typography
} from '@mui/material'
import { LoadingStatus, SelectedStatus } from 'types'
import { Hierarchy, HierarchyInfo, SearchMode } from 'types/hierarchy'
import { KeyboardArrowDown, KeyboardArrowRight, IndeterminateCheckBoxOutlined } from '@mui/icons-material'
import { CellWrapper, RowContainerWrapper, RowWrapper } from '../Hierarchy/styles'
import { sortArray } from 'utils/arrays'
import { v4 as uuidv4 } from 'uuid'
import { LIMIT_PER_PAGE } from 'hooks/search/useSearchParameters'
import { Pagination } from 'components/ui/Pagination'
import { getLabelFromCode, isDisplayedWithCode } from 'utils/valueSets'
import { FhirItem } from 'types/valueSet'
import TruncatedText from 'components/ui/TruncatedText'

type ValueSetRowProps = {
  item: Hierarchy<FhirItem>
  loading: { expand: LoadingStatus; list: LoadingStatus }
  isSelectionDisabled: (node: Hierarchy<FhirItem>) => boolean
  path: string[]
  mode: SearchMode
  isHierarchy: boolean
  onExpand: (node: Hierarchy<FhirItem>) => void
  onSelect: (nodes: Hierarchy<FhirItem>[], toAdd: boolean, mode: SearchMode) => void
}

const ValueSetRow = ({
  item,
  loading,
  isSelectionDisabled,
  path,
  mode,
  isHierarchy,
  onSelect,
  onExpand
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

  return (
    <>
      <RowContainerWrapper container color={path.length % 2 === 0 ? '#f3f5f9' : '#fff'}>
        <RowWrapper
          container
          alignItems="center"
          marginLeft={path.length > 1 ? path.length * 20 - 20 + 'px' : '0'}
          style={{ paddingRight: 10 }}
        >
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
            <TruncatedText lineNb={2} text={getLabelFromCode(item)}></TruncatedText>
          </CellWrapper>
          <CellWrapper item xs={1} container>
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
  onChangePage
}: ValueSetTableProps) => {
  const handleSelect = (checked: boolean) => {
    if (mode === SearchMode.RESEARCH) {
      const notDisabled = hierarchy.tree.filter((node) => !isSelectionDisabled(node))
      onSelect(notDisabled, checked, SearchMode.RESEARCH)
    } else onSelectAll(hierarchy.system, checked)
  }

  return (
    <Grid container direction="column" justifyContent="space-between" height="100%" className="ValueSetTable">
      <Grid container item flexGrow={1}>
        <TableContainer style={{ background: 'white' }}>
          <Table>
            <TableHead>
              {loading.list === LoadingStatus.SUCCESS && !isHierarchy && (
                <RowContainerWrapper container>
                  <RowWrapper container alignItems="center" justifyContent="space-between" style={{ paddingRight: 10 }}>
                    <CellWrapper item xs={1} />
                    <CellWrapper item xs={10}>
                      <Typography color={hierarchy.count ? 'primary' : '#4f4f4f'} fontWeight={600}>
                        {hierarchy.count ? `${hierarchy.count} résultat(s)` : `Aucun résultat à afficher`}
                      </Typography>
                    </CellWrapper>
                    <CellWrapper item xs={1} container>
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
                  {hierarchy.tree.map((item) =>
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
            <Grid container justifyContent="center" alignContent="center" height={500}>
              <CircularProgress />
            </Grid>
          )}
        </TableContainer>
      </Grid>
      <Grid container item>
        {!isHierarchy && loading.list === LoadingStatus.SUCCESS && Math.ceil(hierarchy.count / LIMIT_PER_PAGE) > 1 && (
          <Pagination
            count={Math.ceil(hierarchy.count / LIMIT_PER_PAGE)}
            currentPage={hierarchy.page}
            onPageChange={onChangePage}
            color="#0063AF"
            centered
          />
        )}
      </Grid>
    </Grid>
  )
}

export default ValueSetTable
