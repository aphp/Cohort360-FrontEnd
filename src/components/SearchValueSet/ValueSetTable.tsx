import React, { Fragment, useEffect, useState } from 'react'

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
import { FhirHierarchy, Hierarchy } from 'types/hierarchy'
import { KeyboardArrowDown, KeyboardArrowRight, IndeterminateCheckBoxOutlined } from '@mui/icons-material'
import { CellWrapper, RowContainerWrapper, RowWrapper } from '../Hierarchy/styles'
import { sort } from 'utils/arrays'
import { v4 as uuidv4 } from 'uuid'

type ValueSetRowProps = {
  item: Hierarchy<FhirHierarchy, string>
  loading: { search: LoadingStatus; expand: LoadingStatus }
  path: string[]
  searchMode: boolean
  onExpand: (node: Hierarchy<FhirHierarchy, string>) => void
  onSelect: (node: Hierarchy<FhirHierarchy, string>, toAdd: boolean) => void
}

const ValueSetRow = ({ item, loading, path, searchMode, onSelect, onExpand }: ValueSetRowProps) => {
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

  useEffect(() => {
    // if (path.length === 1) onExpand(item)
  }, [path])

  return (
    <>
      <RowContainerWrapper container color={path.length % 2 === 0 ? '#f3f5f9' : '#fff'}>
        <RowWrapper container alignItems="center" marginLeft={path.length > 1 ? path.length * 30 - 30 + 'px' : '0'}>
          <CellWrapper item xs={1} cursor>
            {!searchMode && (
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
        sort(subItems || [], 'label').map((subItem) => {
          return (
            <ValueSetRow
              searchMode={searchMode}
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
  hierarchy: Hierarchy<FhirHierarchy, string>[]
  loading: { search: LoadingStatus; expand: LoadingStatus }
  searchMode?: boolean
  onExpand: (node: Hierarchy<FhirHierarchy, string>) => void
  onSelect: (node: Hierarchy<FhirHierarchy, string>, toAdd: boolean) => void
  onSelectAll: (toAdd: boolean) => void
}

const ValueSetTable = ({ hierarchy, loading, searchMode = false, onSelect, onExpand }: ValueSetTableProps) => {
  return (
    <TableContainer style={{ overflowX: 'hidden', background: 'white' }}>
      <Table>
        <TableHead />
        <TableBody style={{ height: '100%' }}>
          {loading.search === LoadingStatus.SUCCESS && !hierarchy.length && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography>Aucun résultat à afficher</Typography>
              </TableCell>
            </TableRow>
          )}
          {loading.search !== LoadingStatus.FETCHING &&
            hierarchy.map((item) => {
              if (!item) return <h1 key={uuidv4()}>Missing</h1>
              return (
                <ValueSetRow
                  searchMode={searchMode}
                  loading={loading}
                  path={[item.id]}
                  key={item.id}
                  item={item}
                  onExpand={onExpand}
                  onSelect={onSelect}
                />
              )
            })}
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

export default ValueSetTable
