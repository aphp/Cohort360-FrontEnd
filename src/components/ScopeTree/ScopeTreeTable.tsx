import React, { Fragment, useEffect, useRef, useState } from 'react'
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
import { LoadingStatus } from 'types'
import { Hierarchy, HierarchyInfo, Mode, SearchMode, SelectedStatus } from 'types/hierarchy'
import { IndeterminateCheckBoxOutlined, KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import { format } from 'utils/numbers'
import { CellWrapper, RowContainerWrapper, RowWrapper } from '../Hierarchy/styles'
import { ScopeElement, SourceType } from 'types/scope'
import { v4 as uuidv4 } from 'uuid'
import { isSourceTypeInScopeLevel, perimeterDisplay } from 'utils/perimeters'
import { sortArray } from 'utils/arrays'
import { useIsOverflow } from 'hooks/useIsOverflow'

type HierarchyItemProps = {
  item: Hierarchy<ScopeElement>
  path: string[]
  mode: SearchMode
  sourceType: SourceType
  loading: { search: LoadingStatus; expand: LoadingStatus }
  onSelect: (mode: Mode.SELECT | Mode.SELECT_ALL, toAdd: boolean, codes?: Hierarchy<ScopeElement>[]) => void
  onExpand: (node: Hierarchy<ScopeElement>) => void
}

const ScopeTreeRow = ({ item, path, sourceType, mode, loading, onSelect, onExpand }: HierarchyItemProps) => {
  const [open, setOpen] = useState(false)
  const [internalLoading, setInternalLoading] = useState(false)
  const { id, name, subItems, rights, status, source_value, type, cohort_size, full_path } = item

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
      <RowContainerWrapper color={path.length % 2 === 0 ? '#f3f5f9' : '#fff'}>
        <RowWrapper
          size={mode === SearchMode.RESEARCH ? '75px' : '55px'}
          container
          alignItems="center"
          marginLeft={path.length > 1 ? path.length * 20 - 20 + 'px' : '0'}
        >
          <CellWrapper size={1} cursor>
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
            <CellWrapper cursor size={5}>
              <Breadcrumbs maxItems={2}>
                {(full_path.split('/').length > 1 ? full_path.split('/').slice(1) : full_path.split('/').slice(0)).map(
                  (full_path: string, index, arr) => {
                    const last = index === arr.length - 1
                    return (
                      <Typography fontWeight={last ? 700 : 600} fontSize={last ? 12.5 : 11.5} key={uuidv4()}>
                        {full_path}
                      </Typography>
                    )
                  }
                )}
              </Breadcrumbs>
            </CellWrapper>
          )}
          {mode === SearchMode.EXPLORATION && (
            <CellWrapper
              cursor
              size={5}
              onClick={() => (open ? setOpen(false) : handleOpen())}
              fontSize={12.5}
              fontWeight={700}
            >
              {perimeterDisplay(source_value, name)}
            </CellWrapper>
          )}
          <CellWrapper size={2} textAlign="center" fontSize={11.5}>
            {format(+cohort_size)}
          </CellWrapper>
          {sourceType === SourceType.ALL && (
            <CellWrapper size={3} textAlign="center" fontSize={11.5}>
              {rights && <Fragment>{servicesPerimeters.getAccessFromRights(rights)}</Fragment>}
            </CellWrapper>
          )}
          {sourceType !== SourceType.ALL && (
            <CellWrapper size={3} textAlign="center" fontSize={11.5}>
              {type}
            </CellWrapper>
          )}
          <CellWrapper size={1} container sx={{ justifyContent: 'flex-end' }}>
            <Checkbox
              checked={status === SelectedStatus.SELECTED}
              indeterminate={status === SelectedStatus.INDETERMINATE}
              color="secondary"
              indeterminateIcon={<IndeterminateCheckBoxOutlined />}
              onChange={(event, checked) => onSelect(Mode.SELECT, checked, [item])}
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

type HierarchyProps = {
  hierarchy: HierarchyInfo<ScopeElement>
  mode: SearchMode
  selectAllStatus: SelectedStatus
  sourceType: SourceType
  loading: { search: LoadingStatus; expand: LoadingStatus }
  onExpand: (node: Hierarchy<ScopeElement, string>) => void
  onSelect: (mode: Mode.SELECT | Mode.SELECT_ALL, toAdd: boolean, codes?: Hierarchy<ScopeElement>[]) => void
}

const ScopeTreeTable = ({
  hierarchy,
  mode,
  selectAllStatus,
  sourceType,
  loading,
  onSelect,
  onExpand
}: HierarchyProps) => {
  const handleSelect = (checked: boolean) => {
    if (mode === SearchMode.RESEARCH) {
      onSelect(Mode.SELECT, checked, hierarchy.tree)
    } else onSelect(Mode.SELECT_ALL, checked)
  }
  const isChrome = navigator.userAgent.toLowerCase().includes('chrome')
  const tableBodyRef = useRef<HTMLDivElement | null>(null)
  const isOverflow = useIsOverflow({ ref: tableBodyRef, additionalDependencies: { mode: mode, hierarchy: hierarchy } })

  return (
    <TableContainer style={{ overflowX: 'hidden', background: 'white' }}>
      <Table>
        <TableHead>
          <RowContainerWrapper alignItems="center" container color={'#d1e2f4'} height={'60px'}>
            <CellWrapper size={1}></CellWrapper>
            <CellWrapper size={5} color="#0063AF">
              Nom
            </CellWrapper>
            <CellWrapper size={2} textAlign="center" color="#0063AF">
              Nombre de patients
            </CellWrapper>
            <CellWrapper size={3} textAlign="center" color="#0063AF">
              {sourceType === SourceType.ALL ? 'Accès' : 'Type'}
            </CellWrapper>
            <CellWrapper size={1} container sx={{ justifyContent: 'flex-end' }}>
              <Checkbox
                color="secondary"
                checked={selectAllStatus === SelectedStatus.SELECTED}
                indeterminate={selectAllStatus === SelectedStatus.INDETERMINATE}
                indeterminateIcon={<IndeterminateCheckBoxOutlined style={{ color: 'rgba(0,0,0,0.6)' }} />}
                onChange={(event, checked) => handleSelect(checked)}
                style={{ marginRight: isChrome && isOverflow ? 15 : undefined }}
              />
            </CellWrapper>
          </RowContainerWrapper>
        </TableHead>
        <TableBody style={{ height: '100%' }}>
          {loading.search === LoadingStatus.SUCCESS && !hierarchy.tree.length && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography>Aucun résultat à afficher</Typography>
              </TableCell>
            </TableRow>
          )}
          {loading.search !== LoadingStatus.FETCHING && (
            <div
              style={{
                maxHeight: mode === SearchMode.EXPLORATION ? '65vh' : '60vh',
                overflow: 'auto'
              }}
              ref={tableBodyRef}
            >
              {hierarchy.tree.map((item) =>
                item ? (
                  <ScopeTreeRow
                    loading={loading}
                    path={[item.id]}
                    mode={mode}
                    key={item.id}
                    item={item}
                    sourceType={sourceType}
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
      {loading.search === LoadingStatus.FETCHING && (
        <Grid container sx={{ justifyContent: 'center', alignContent: 'center' }} height={500}>
          <CircularProgress />
        </Grid>
      )}
    </TableContainer>
  )
}

export default ScopeTreeTable
