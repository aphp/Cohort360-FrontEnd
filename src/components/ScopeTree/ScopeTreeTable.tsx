import React, { Fragment, useEffect, useState } from 'react'
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
import { Hierarchy } from 'types/hierarchy'
import { IndeterminateCheckBoxOutlined, KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import displayDigit from 'utils/displayDigit'
import { CellWrapper, RowContainerWrapper, RowWrapper } from '../Hierarchy/styles'
import { SourceType } from 'types/scope'
import { v4 as uuidv4 } from 'uuid'
import { isSourceTypeInScopeLevel } from 'utils/perimeters'
import { every } from 'lodash'
import { sortArray } from 'utils/arrays'

type HierarchyItemProps = {
  item: Hierarchy<ScopeElement, string>
  path: string[]
  searchMode: boolean
  sourceType: SourceType
  loading: { search: LoadingStatus; expand: LoadingStatus }
  onSelect: (node: Hierarchy<ScopeElement, string>, toAdd: boolean) => void
  onExpand: (node: Hierarchy<ScopeElement, string>) => void
}

const ScopeTreeRow = ({ item, path, sourceType, searchMode, loading, onSelect, onExpand }: HierarchyItemProps) => {
  const [open, setOpen] = useState(false)
  const [internalLoading, setInternalLoading] = useState(false)
  const { id, name, subItems, rights, status, source_value, type, cohort_size, full_path } = item
  const canExpand = !(
    subItems?.length === 0 ||
    (subItems && every(subItems, (item) => isSourceTypeInScopeLevel(sourceType, item.type) === false))
  )

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
          size={searchMode ? '75px' : '55px'}
          container
          alignItems="center"
          marginLeft={path.length > 1 ? path.length * 20 - 20 + 'px' : '0'}
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

          {searchMode && full_path && (
            <CellWrapper cursor item xs={5}>
              <Breadcrumbs maxItems={2}>
                {(full_path.split('/').length > 1 ? full_path.split('/').slice(1) : full_path.split('/').slice(0)).map(
                  (full_path: string) => (
                    <Typography fontWeight={600} key={uuidv4()}>
                      {full_path}
                    </Typography>
                  )
                )}
              </Breadcrumbs>
            </CellWrapper>
          )}
          {!searchMode && (
            <CellWrapper cursor item xs={5} onClick={() => (open ? setOpen(false) : handleOpen())}>
              {`${source_value} - ${name}`}
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
          <CellWrapper item xs={1} container justifyContent="flex-end">
            <Checkbox
              checked={status === SelectedStatus.SELECTED}
              indeterminate={status === SelectedStatus.INDETERMINATE}
              color="secondary"
              indeterminateIcon={<IndeterminateCheckBoxOutlined />}
              onChange={(event, checked) => onSelect(item, checked)}
              inputProps={{ 'aria-labelledby': name }}
            />
          </CellWrapper>
        </RowWrapper>
      </RowContainerWrapper>
      {!internalLoading &&
        open &&
        sortArray(subItems || [], 'source_value').map((subItem: Hierarchy<ScopeElement, string>) => {
          if (isSourceTypeInScopeLevel(sourceType, subItem.type)) {
            return (
              <ScopeTreeRow
                loading={loading}
                sourceType={sourceType}
                path={[...path, id]}
                searchMode={searchMode}
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

type HierarchyProps = {
  hierarchy: Hierarchy<ScopeElement, string>[]
  searchMode: boolean
  selectAllStatus: SelectedStatus
  sourceType: SourceType
  loading: { search: LoadingStatus; expand: LoadingStatus }
  onExpand: (node: Hierarchy<ScopeElement, string>) => void
  onSelect: (node: Hierarchy<ScopeElement, string>, toAdd: boolean) => void
  onSelectAll: (toAdd: boolean) => void
}

const ScopeTreeTable = ({
  hierarchy,
  searchMode,
  selectAllStatus,
  sourceType,
  loading,
  onSelect,
  onSelectAll,
  onExpand
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

export default ScopeTreeTable
