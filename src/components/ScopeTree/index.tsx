import React, { useEffect, useState } from 'react'
import { useAppSelector } from 'state'
import { Back_API_Response, LoadingStatus, ScopeElement, ScopeTreeRow, ScopeType, SelectedStatus } from 'types'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import {
  Checkbox,
  CircularProgress,
  Grid,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useHierarchy } from '../../hooks/hierarchy/useHierarchy'
import { useSearchParameters } from '../../hooks/useSearchParameters'
import servicesPerimeters from '../../services/aphp/servicePerimeters'
import useStyles from './utils/styles'
import { IndeterminateCheckBoxOutlined } from '@mui/icons-material'
import ScopeTreeTest from './ScopeTreeTest'
import { Hierarchy, InfiniteMap } from 'types/hierarchy'
import SelectedCodes from './SelectedCodes'
import { useFetch } from 'hooks/useFetch'

/*
export type ScopeTreeSearchProps = {
  searchInput: string
  selectedItems: ScopeTreeRow[]
  setSelectedItems: (selectedItems: ScopeTreeRow[]) => void
  searchSavedRootRows: ScopeTreeRow[]
  setSearchSavedRootRows: (selectedItems: ScopeTreeRow[]) => void
  isSelectionLoading: boolean
  setIsSelectionLoading: (isSelectionLoading: boolean) => void
  executiveUnitType?: ScopeType
}

export type ScopeTreeExplorationProps = {
  selectedItems: ScopeTreeRow[]
  setSelectedItems: (selectedItems: ScopeTreeRow[]) => void
  searchSavedRootRows: ScopeTreeRow[]
  setSearchSavedRootRows: (selectedItems: ScopeTreeRow[]) => void
  openPopulation: number[]
  setOpenPopulations: (openPopulation: number[]) => void
  isSelectionLoading: boolean
  setIsSelectionLoading: (isSelectionLoading: boolean) => void
  executiveUnitType?: ScopeType
}

type ScopeTreeExcludedProps = {
  searchInput: string
  searchRootRows: ScopeTreeRow[]
  setSearchRootRows: (selectedItems: ScopeTreeRow[]) => void
  isSelectionLoading: boolean
  setIsSelectionLoading: (isSelectionLoading: boolean) => void
  searchSavedRootRows: ScopeTreeRow[]
  setSearchSavedRootRows: (selectedItems: ScopeTreeRow[]) => void
}
type ScopeTreeProps = {
  [K in Exclude<
    keyof ScopeTreeExplorationProps | keyof ScopeTreeSearchProps,
    keyof ScopeTreeExcludedProps
  >]: K extends keyof ScopeTreeExplorationProps
    ? ScopeTreeExplorationProps[K]
    : K extends keyof ScopeTreeSearchProps
    ? ScopeTreeSearchProps[K]
    : never
}
*/

type ScopeTreeProps = {
  selectedIds: string
  setSelectedItems: (selectedItems: ScopeTreeRow[]) => void
  isExecutiveUnit: boolean
  executiveUnitType?: ScopeType
}

const Index = ({ selectedIds, setSelectedItems, isExecutiveUnit, executiveUnitType }: ScopeTreeProps) => {
  const { classes } = useStyles()
  const practitionnerId = useAppSelector((state) => state.me)?.id || ''
  const { options, totalPageNumber, onChangeSearchInput, onChangePage } = useSearchParameters(20, 0)
  const {
    fetchStatus,
    response: { count, results }
  } = useFetch(options, () =>
    isExecutiveUnit ? servicesPerimeters.getPerimeters(practitionnerId) : servicesPerimeters.getRights(practitionnerId)
  )
  const [defaultLevels, setDefaultLevels] = useState<Hierarchy<ScopeElement, string>[]>([])
  const [previousSelectedCodes, setPreviousSelectedCodes] = useState<Hierarchy<ScopeElement, string>[]>([])
  const { hierarchy, selectedCodes, expandHierarchy, selectHierarchyCodes, deleteHierarchyCode } = useHierarchy(
    defaultLevels,
    previousSelectedCodes
  )

  function getUniquePaths(paths: string[][]) {
    const tree = new Map()
    for (const path of paths) {
      let currentNode = tree
      for (const id of path) {
        if (!currentNode.has(id)) {
          currentNode.set(id, new Map())
        }
        currentNode = currentNode.get(id)
      }
    }
    return tree
  }

  const constructHierarchy = async (
    selectedCodes: Hierarchy<ScopeElement, string>[],
    defaultLevels: ScopeElement[]
  ) => {
    const paths = selectedCodes.map((item) => [...item.above_levels_ids.split(',').slice(1), ...[item.id]])
    const uniquePaths: InfiniteMap = getUniquePaths(paths)
    const newTree = buildTree(uniquePaths, defaultLevels)
    setDefaultLevels(newTree)
  }

  const buildTree = (uniquePaths: InfiniteMap, baseLevels: Hierarchy<ScopeElement, string>[]) => {
    const buildBranch = async (path: [string, InfiniteMap], node: Hierarchy<ScopeElement, string>[]) => {
      const [key, nextPath] = path
      const currentIndex = node.findIndex((elem) => elem.id === key)
      node[currentIndex].status = nextPath.size ? SelectedStatus.INDETERMINATE : SelectedStatus.SELECTED
      if (!nextPath.size) return
      const { results: children } = isExecutiveUnit
        ? await servicesPerimeters.getPerimeters(practitionnerId, node[currentIndex].inferior_levels_ids)
        : await servicesPerimeters.getRights(practitionnerId, node[currentIndex].inferior_levels_ids)
      node[currentIndex].subItems = children
      nextPath.forEach((value, key) => buildBranch([key, value], node[currentIndex].subItems || []))
    }
    const newTree = [...baseLevels]
    for (const path of uniquePaths) {
      buildBranch(path, newTree)
    }
    return newTree
  }

  useEffect(() => {
    const handleFetchSelectedCodes = async () => {
      const { results } = isExecutiveUnit
        ? await servicesPerimeters.getPerimeters(practitionnerId, selectedIds)
        : await servicesPerimeters.getRights(practitionnerId, selectedIds)
      setPreviousSelectedCodes(results)
    }
    if (selectedIds) handleFetchSelectedCodes()
  }, [isExecutiveUnit, practitionnerId, selectedIds])

  useEffect(() => {
    if (previousSelectedCodes.length) constructHierarchy(previousSelectedCodes, results)
    else setDefaultLevels(results)
  }, [previousSelectedCodes, results])

  const handleExpand = (path: number[], childrenIds: string) => {
    const fetchChild = (): Promise<Back_API_Response<Hierarchy<ScopeElement, string>>> =>
      isExecutiveUnit
        ? servicesPerimeters.getPerimeters(practitionnerId, childrenIds)
        : servicesPerimeters.getRights(practitionnerId, childrenIds)
    expandHierarchy(path, fetchChild)
  }

  return (
    <>
      <Grid style={{ width: '25%', marginLeft: '75%', marginBottom: '10px' }}>
        <SearchInput
          value={options.searchInput}
          placeholder={'Rechercher'}
          onchange={(newValue) => onChangeSearchInput(newValue)}
        />{' '}
      </Grid>

      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow className={classes.tableHead}>
              <TableCell className={classes.emptyTableHeadCell}></TableCell>
              <TableCell align="center" className={classes.emptyTableHeadCell}>
                <Checkbox color="secondary" indeterminateIcon={<IndeterminateCheckBoxOutlined />} />
              </TableCell>
              <TableCell align="left" className={classes.tableHeadCell}>
                Nom
              </TableCell>

              <TableCell align="center" className={classes.tableHeadCell}>
                Nombre de patients
              </TableCell>

              <TableCell align="center" className={classes.tableHeadCell}>
                {!!executiveUnitType ? 'Type' : 'Accès'}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fetchStatus === LoadingStatus.SUCCESS && count && (
              <ScopeTreeTest hierarchy={hierarchy} onExpand={handleExpand} onSelect={selectHierarchyCodes} />
            )}
            {fetchStatus === LoadingStatus.SUCCESS && !count && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography className={classes.loadingSpinnerContainer}>Aucun résultat à afficher</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {fetchStatus === LoadingStatus.FETCHING && (
        <Grid container justifyContent="center" alignContent="center" height={500}>
          <CircularProgress />
        </Grid>
      )}

      {/*<Pagination
        // className={classes.pagination}
        count={Math.ceil((count ?? 0) / 100)}
        shape="circular"
        onChange={(event, page: number) => onChangePage(page)}
        page={options.page}
    />*/}

      {/*searchInput ? (
        <ScopeTreeSearch
          searchInput={searchInput}
          selectedItems={fixSelectedItems}
          setSelectedItems={setSelectedItems}
          searchSavedRootRows={searchSavedRootRows}
          setSearchSavedRootRows={setSearchSavedRootRows}
          executiveUnitType={executiveUnitType}
          isSelectionLoading={isSelectionLoading}
          setIsSelectionLoading={setIsSelectionLoading}
        />
      ) : (

      )}
      */}

      <Grid item xs={12} style={{ backgroundColor: '#E6F1FD', height: '12vh' }} padding="20px 40px 0px 40px">
        <SelectedCodes values={selectedCodes} onDelete={deleteHierarchyCode} />
      </Grid>
    </>
  )
}
export default Index
